import prisma from '../config/db.js';
import AppError from '../utils/AppError.js';

const getConfirmedBookingCount = async (eventId, tx = prisma) => {
  return tx.booking.count({
    where: { eventId, status: 'CONFIRMED' },
  });
};

const getConfirmedBookingCountsByEvent = async (eventIds, tx = prisma) => {
  if (!eventIds.length) return {};

  const counts = await tx.booking.groupBy({
    by: ['eventId'],
    where: {
      eventId: { in: eventIds },
      status: 'CONFIRMED',
    },
    _count: {
      _all: true,
    },
  });

  return Object.fromEntries(counts.map((item) => [item.eventId, item._count._all]));
};

export const formatEventWithSeats = async (event, tx = prisma) => {
  const seatsSold = await getConfirmedBookingCount(event.id, tx);
  const remainingSeats = Math.max(0, event.capacity - seatsSold);

  return {
    ...event,
    seatsSold,
    remainingSeats,
    isSoldOut: seatsSold >= event.capacity,
  };
};

export const getEvents = async ({ search, date, page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const now = new Date();

  const where = {};

  if (date) {
    const filterDate = new Date(date);
    const nextDay = new Date(filterDate);
    nextDay.setDate(nextDay.getDate() + 1);
    where.eventDate = {
      gte: filterDate,
      lt: nextDay,
    };
  } else {
    where.eventDate = { gte: now };
  }

  if (search) {
    where.title = { contains: search, mode: 'insensitive' };
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { eventDate: 'asc' },
      skip,
      take: limit,
      include: {
        organizer: {
          select: { id: true, name: true },
        },
      },
    }),
    prisma.event.count({ where }),
  ]);

  const eventsWithSeats = await Promise.all(
    events.map((event) => formatEventWithSeats(event))
  );

  return {
    events: eventsWithSeats,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getEventById = async (id) => {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      organizer: {
        select: { id: true, name: true },
      },
    },
  });

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  return formatEventWithSeats(event);
};

export const logActivity = async ({ userId, eventId, actionType }, tx = prisma) => {
  return tx.activityLog.create({
    data: {
      userId: userId || null,
      eventId,
      actionType,
    },
  });
};

export const bookEvent = async (eventId, userId) => {
  return prisma.$transaction(
    async (tx) => {
      const events = await tx.$queryRaw`
        SELECT id, capacity, price, title, "eventDate", venue
        FROM events
        WHERE id = ${eventId}
        FOR UPDATE
      `;

      if (!events || events.length === 0) {
        throw new AppError('Event not found', 404);
      }

      const event = events[0];

      const existingBooking = await tx.booking.findUnique({
        where: {
          userId_eventId: { userId, eventId },
        },
      });

      if (existingBooking && existingBooking.status === 'CONFIRMED') {
        throw new AppError('You have already booked this event', 400);
      }

      const confirmedCount = await tx.booking.count({
        where: { eventId, status: 'CONFIRMED' },
      });

      if (confirmedCount >= event.capacity) {
        throw new AppError('Event is sold out', 400);
      }

      await logActivity({ userId, eventId, actionType: 'BOOKING_STARTED' }, tx);

      let booking;

      if (existingBooking) {
        booking = await tx.booking.update({
          where: { id: existingBooking.id },
          data: { status: 'CONFIRMED' },
          include: {
            event: {
              select: {
                id: true,
                title: true,
                eventDate: true,
                venue: true,
                price: true,
              },
            },
          },
        });
      } else {
        booking = await tx.booking.create({
          data: {
            userId,
            eventId,
            status: 'CONFIRMED',
          },
          include: {
            event: {
              select: {
                id: true,
                title: true,
                eventDate: true,
                venue: true,
                price: true,
              },
            },
          },
        });
      }

      await logActivity({ userId, eventId, actionType: 'BOOKING_CONFIRMED' }, tx);

      return booking;
    },
    {
      isolationLevel: 'Serializable',
      maxWait: 5000,
      timeout: 10000,
    }
  );
};

export const createEvent = async (organizerId, data) => {
  return prisma.event.create({
    data: {
      ...data,
      eventDate: new Date(data.eventDate),
      organizerId,
    },
  });
};

export const updateEvent = async (eventId, organizerId, data) => {
  const event = await prisma.event.findFirst({
    where: { id: eventId, organizerId },
  });

  if (!event) {
    throw new AppError('Event not found or access denied', 404);
  }

  if (data.capacity !== undefined) {
    const seatsSold = await getConfirmedBookingCount(eventId);
    if (data.capacity < seatsSold) {
      throw new AppError(
        `Capacity cannot be lower than already booked seats (${seatsSold})`,
        400
      );
    }
  }

  const updateData = { ...data };
  if (updateData.eventDate) {
    updateData.eventDate = new Date(updateData.eventDate);
  }

  return prisma.event.update({
    where: { id: eventId },
    data: updateData,
  });
};

export const getOrganizerEvents = async (organizerId) => {
  const events = await prisma.event.findMany({
    where: { organizerId },
    orderBy: { eventDate: 'desc' },
  });

  const eventIds = events.map((event) => event.id);
  const bookingCounts = await getConfirmedBookingCountsByEvent(eventIds);

  const activityLogs = await prisma.activityLog.groupBy({
    by: ['eventId', 'actionType'],
    where: { eventId: { in: eventIds } },
    _count: { actionType: true },
  });

  const eventLogMap = {};
  activityLogs.forEach((entry) => {
    eventLogMap[entry.eventId] = eventLogMap[entry.eventId] || {};
    eventLogMap[entry.eventId][entry.actionType] = entry._count.actionType;
  });

  return events.map((event) => {
    const seatsSold = bookingCounts[event.id] ?? 0;
    const views = eventLogMap[event.id]?.EVENT_VIEWED ?? 0;
    const confirmedBookings = eventLogMap[event.id]?.BOOKING_CONFIRMED ?? seatsSold;
    const conversionRate = views > 0 ? parseFloat(((confirmedBookings / views) * 100).toFixed(2)) : 0;
    const revenue = seatsSold * event.price;

    return {
      ...event,
      seatsSold,
      remainingSeats: Math.max(0, event.capacity - seatsSold),
      revenue,
      isSoldOut: seatsSold >= event.capacity,
      views,
      conversionRate,
    };
  });
};

export const getOrganizerDashboard = async (organizerId) => {
  const events = await prisma.event.findMany({
    where: { organizerId },
    select: {
      id: true,
      title: true,
      price: true,
      capacity: true,
      eventDate: true,
    },
  });

  const eventIds = events.map((e) => e.id);
  const totalEvents = events.length;

  if (totalEvents === 0) {
    return {
      totalEvents: 0,
      totalBookings: 0,
      totalRevenue: 0,
      soldOutEvents: 0,
      upcomingEvents: 0,
      averageRevenuePerEvent: 0,
      averageBookingsPerEvent: 0,
      overallConversionRate: 0,
      topEvent: null,
    };
  }

  const bookingGroups = await prisma.booking.groupBy({
    by: ['eventId'],
    where: { eventId: { in: eventIds }, status: 'CONFIRMED' },
    _count: { _all: true },
  });

  const activityGroups = await prisma.activityLog.groupBy({
    by: ['actionType'],
    where: { eventId: { in: eventIds } },
    _count: { actionType: true },
  });

  const bookingCountMap = Object.fromEntries(
    bookingGroups.map((group) => [group.eventId, group._count._all])
  );

  const totalBookings = bookingGroups.reduce((sum, group) => sum + group._count._all, 0);
  const totalRevenue = events.reduce(
    (sum, event) => sum + (bookingCountMap[event.id] || 0) * event.price,
    0
  );

  const today = new Date();
  const soldOutEvents = events.filter(
    (event) => (bookingCountMap[event.id] || 0) >= event.capacity
  ).length;
  const upcomingEvents = events.filter((event) => event.eventDate >= today).length;
  const averageRevenuePerEvent = totalEvents > 0 ? totalRevenue / totalEvents : 0;
  const averageBookingsPerEvent = totalEvents > 0 ? totalBookings / totalEvents : 0;

  const viewsCount = activityGroups.find((group) => group.actionType === 'EVENT_VIEWED')?._count.actionType || 0;
  const overallConversionRate = viewsCount > 0 ? parseFloat(((totalBookings / viewsCount) * 100).toFixed(2)) : 0;

  const topEvent = events
    .map((event) => ({
      id: event.id,
      title: event.title,
      revenue: (bookingCountMap[event.id] || 0) * event.price,
      bookings: bookingCountMap[event.id] || 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)[0] || null;

  return {
    totalEvents,
    totalBookings,
    totalRevenue,
    soldOutEvents,
    upcomingEvents,
    averageRevenuePerEvent,
    averageBookingsPerEvent,
    overallConversionRate,
    topEvent,
  };
};

export const getEventAttendees = async (eventId, organizerId) => {
  const event = await prisma.event.findFirst({
    where: { id: eventId, organizerId },
    select: { id: true, title: true },
  });

  if (!event) {
    throw new AppError('Event not found or access denied', 404);
  }

  const bookings = await prisma.booking.findMany({
    where: { eventId },
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return {
    eventTitle: event.title,
    attendees: bookings.map((booking) => ({
      id: booking.id,
      name: booking.user.name,
      email: booking.user.email,
      bookingDate: booking.createdAt,
      status: booking.status,
    })),
  };
};

export const getEventAnalytics = async (eventId, organizerId) => {
  const event = await prisma.event.findFirst({
    where: { id: eventId, organizerId },
    select: {
      id: true,
      title: true,
      venue: true,
      eventDate: true,
      capacity: true,
      price: true,
    },
  });

  if (!event) {
    throw new AppError('Event not found or access denied', 404);
  }

  const logs = await prisma.activityLog.groupBy({
    by: ['actionType'],
    where: { eventId },
    _count: { actionType: true },
  });

  const bookingGroups = await prisma.booking.groupBy({
    by: ['status'],
    where: { eventId },
    _count: { status: true },
  });

  const counts = {
    EVENT_VIEWED: 0,
    BOOKING_STARTED: 0,
    BOOKING_CONFIRMED: 0,
    BOOKING_CANCELLED: 0,
  };

  logs.forEach((log) => {
    counts[log.actionType] = log._count.actionType;
  });

  const bookingCountMap = Object.fromEntries(
    bookingGroups.map((group) => [group.status, group._count.status])
  );

  const confirmedCount = bookingCountMap.CONFIRMED || 0;
  const cancelledCount = bookingCountMap.CANCELLED || 0;
  const totalViews = counts.EVENT_VIEWED;
  const conversionRate = totalViews > 0 ? parseFloat(((confirmedCount / totalViews) * 100).toFixed(2)) : 0;
  const revenue = confirmedCount * event.price;
  const remainingSeats = Math.max(0, event.capacity - confirmedCount);
  const bookingRate = event.capacity > 0 ? parseFloat(((confirmedCount / event.capacity) * 100).toFixed(2)) : 0;

  return {
    eventId,
    eventTitle: event.title,
    venue: event.venue,
    eventDate: event.eventDate,
    capacity: event.capacity,
    price: event.price,
    totalViews,
    bookingStarted: counts.BOOKING_STARTED,
    bookingConfirmed: confirmedCount,
    bookingCancelled: cancelledCount,
    conversionRate,
    revenue,
    seatsSold: confirmedCount,
    remainingSeats,
    bookingRate,
  };
};
