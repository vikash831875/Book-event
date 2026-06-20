import asyncHandler from '../utils/asyncHandler.js';
import * as eventService from '../services/event.service.js';

export const getEvents = asyncHandler(async (req, res) => {
  const { search, date, page, limit } = req.query;

  const result = await eventService.getEvents({
    search,
    date,
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
});

export const getEventById = asyncHandler(async (req, res) => {
  const event = await eventService.getEventById(req.params.id);

  await eventService.logActivity({
    userId: req.user?.id || null,
    eventId: req.params.id,
    actionType: 'EVENT_VIEWED',
  });

  res.status(200).json({
    success: true,
    data: { event },
  });
});

export const bookEvent = asyncHandler(async (req, res) => {
  const booking = await eventService.bookEvent(req.params.id, req.user.id);

  res.status(201).json({
    success: true,
    message: 'Booking confirmed successfully',
    data: { booking },
  });
});
