import asyncHandler from '../utils/asyncHandler.js';
import * as bookingService from '../services/booking.service.js';

export const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getUserBookings(req.user.id);

  res.status(200).json({
    success: true,
    data: { bookings },
  });
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.cancelBooking(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Booking cancelled successfully',
    data: { booking },
  });
});
