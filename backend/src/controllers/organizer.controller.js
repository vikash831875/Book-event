import asyncHandler from '../utils/asyncHandler.js';
import * as eventService from '../services/event.service.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const stats = await eventService.getOrganizerDashboard(req.user.id);

  res.status(200).json({
    success: true,
    data: { stats },
  });
});

export const createEvent = asyncHandler(async (req, res) => {
  const event = await eventService.createEvent(req.user.id, req.body);

  res.status(201).json({
    success: true,
    message: 'Event created successfully',
    data: { event },
  });
});

export const updateEvent = asyncHandler(async (req, res) => {
  const event = await eventService.updateEvent(req.params.id, req.user.id, req.body);

  res.status(200).json({
    success: true,
    message: 'Event updated successfully',
    data: { event },
  });
});

export const getOrganizerEvents = asyncHandler(async (req, res) => {
  const events = await eventService.getOrganizerEvents(req.user.id);

  res.status(200).json({
    success: true,
    data: { events },
  });
});

export const getEventAttendees = asyncHandler(async (req, res) => {
  const attendees = await eventService.getEventAttendees(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    data: { attendees },
  });
});

export const getEventAnalytics = asyncHandler(async (req, res) => {
  const analytics = await eventService.getEventAnalytics(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    data: { analytics },
  });
});
