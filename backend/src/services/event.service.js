import prisma from '../config/db.js';
import AppError from '../utils/AppError.js';

const getConfirmedBookingCount = async (eventId, tx = prisma) => {
  return tx.booking.count({
    where: { eventId, status: 'CONFIRMED' },
  });
};

export const formatEventWithSeats = async (event, tx = prisma) => {
  const seatsSold = await getConfirmedBookingCount(event.id, tx);
  const remainingSeats = Math.max(0, event.capacity - seatsSold);

  return {
    ...event,
    seatsSold,
    remainingSeats,
    isSoldOut: remainingSeats === 0,
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

  return Promise.all(
    events.map(async (event) => {
      const seatsSold = await getConfirmedBookingCount(event.id);
      const revenue = seatsSold * event.price;

      return {
        ...event,
        seatsSold,
        remainingSeats: event.capacity - seatsSold,
        revenue,
        isSoldOut: seatsSold >= event.capacity,
      };
    })
  );
};

export const getOrganizerDashboard = async (organizerId) => {
  const events = await prisma.event.findMany({
    where: { organizerId },
    select: { id: true, price: true },
  });

  const eventIds = events.map((e) => e.id);
  const totalEvents = events.length;

  if (totalEvents === 0) {
    return { totalEvents: 0, totalBookings: 0, totalRevenue: 0 };
  }

  const bookings = await prisma.booking.findMany({
    where: { eventId: { in: eventIds }, status: 'CONFIRMED' },
    select: { eventId: true },
  });

  const priceMap = Object.fromEntries(events.map((e) => [e.id, e.price]));
  const totalRevenue = bookings.reduce((sum, b) => sum + (priceMap[b.eventId] || 0), 0);

  return {
    totalEvents,
    totalBookings: bookings.length,
    totalRevenue,
  };
};

export const getEventAttendees = async (eventId, organizerId) => {
  const event = await prisma.event.findFirst({
    where: { id: eventId, organizerId },
  });

  if (!event) {
    throw new AppError('Event not found or access denied', 404);
  }

  const bookings = await prisma.booking.findMany({
    where: { eventId, status: 'CONFIRMED' },
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return bookings.map((booking) => ({
    id: booking.id,
    name: booking.user.name,
    email: booking.user.email,
    bookingDate: booking.createdAt,
  }));
};

export const getEventAnalytics = async (eventId, organizerId) => {
  const event = await prisma.event.findFirst({
    where: { id: eventId, organizerId },
  });

  if (!event) {
    throw new AppError('Event not found or access denied', 404);
  }

  const logs = await prisma.activityLog.groupBy({
    by: ['actionType'],
    where: { eventId },
    _count: { actionType: true },
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

  const totalViews = counts.EVENT_VIEWED;
  const bookingConfirmed = counts.BOOKING_CONFIRMED;
  const conversionRate =
    totalViews > 0 ? parseFloat(((bookingConfirmed / totalViews) * 100).toFixed(2)) : 0;

  return {
    eventId,
    eventTitle: event.title,
    totalViews,
    bookingStarted: counts.BOOKING_STARTED,
    bookingConfirmed,
    bookingCancelled: counts.BOOKING_CANCELLED,
    conversionRate,
  };
};
