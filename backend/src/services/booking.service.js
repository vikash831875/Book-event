import prisma from '../config/db.js';
import AppError from '../utils/AppError.js';
import { logActivity } from './event.service.js';

export const getUserBookings = async (userId) => {
  const bookings = await prisma.booking.findMany({
    where: { userId },
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
    orderBy: { createdAt: 'desc' },
  });

  return bookings;
};

export const cancelBooking = async (bookingId, userId) => {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findFirst({
      where: { id: bookingId, userId },
      include: { event: true },
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (booking.status === 'CANCELLED') {
      throw new AppError('Booking is already cancelled', 400);
    }

    const updatedBooking = await tx.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
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

    await logActivity(
      {
        userId,
        eventId: booking.eventId,
        actionType: 'BOOKING_CANCELLED',
      },
      tx
    );

    return updatedBooking;
  });
};
