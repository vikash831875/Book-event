import api from './axios';

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

export const eventAPI = {
  getEvents: (params) => api.get('/events', { params }),
  getEventById: (id) => api.get(`/events/${id}`),
  bookEvent: (id) => api.post(`/events/${id}/book`),
};

export const bookingAPI = {
  getMyBookings: () => api.get('/bookings/me'),
  cancelBooking: (id) => api.delete(`/bookings/${id}`),
};

export const organizerAPI = {
  getDashboard: () => api.get('/organizer/dashboard'),
  getEvents: () => api.get('/organizer/events'),
  createEvent: (data) => api.post('/organizer/events', data),
  updateEvent: (id, data) => api.patch(`/organizer/events/${id}`, data),
  getAttendees: (id) => api.get(`/organizer/events/${id}/attendees`),
  getAnalytics: (id) => api.get(`/organizer/events/${id}/analytics`),
};
