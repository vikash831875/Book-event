import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { eventAPI, organizerAPI } from '../../api';

export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (params, { rejectWithValue }) => {
    try {
      const response = await eventAPI.getEvents(params);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchEventById = createAsyncThunk(
  'events/fetchEventById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await eventAPI.getEventById(id);
      return response.data.data.event;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const bookEvent = createAsyncThunk(
  'events/bookEvent',
  async (id, { rejectWithValue }) => {
    try {
      const response = await eventAPI.bookEvent(id);
      return response.data.data.booking;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchOrganizerEvents = createAsyncThunk(
  'events/fetchOrganizerEvents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await organizerAPI.getEvents();
      return response.data.data.events;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (data, { rejectWithValue }) => {
    try {
      const response = await organizerAPI.createEvent(data);
      return response.data.data.event;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await organizerAPI.updateEvent(id, data);
      return response.data.data.event;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchDashboard = createAsyncThunk(
  'events/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await organizerAPI.getDashboard();
      return response.data.data.stats;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAttendees = createAsyncThunk(
  'events/fetchAttendees',
  async (id, { rejectWithValue }) => {
    try {
      const response = await organizerAPI.getAttendees(id);
      return response.data.data.attendees;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAnalytics = createAsyncThunk(
  'events/fetchAnalytics',
  async (id, { rejectWithValue }) => {
    try {
      const response = await organizerAPI.getAnalytics(id);
      return response.data.data.analytics;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const eventSlice = createSlice({
  name: 'events',
  initialState: {
    events: [],
    currentEvent: null,
    organizerEvents: [],
    dashboard: null,
    attendees: [],
    analytics: null,
    pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    loading: false,
    bookingLoading: false,
    error: null,
    bookingError: null,
    bookingSuccess: false,
  },
  reducers: {
    clearEventError: (state) => {
      state.error = null;
      state.bookingError = null;
    },
    clearBookingSuccess: (state) => {
      state.bookingSuccess = false;
    },
    clearCurrentEvent: (state) => {
      state.currentEvent = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload.events;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchEventById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEvent = action.payload;
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(bookEvent.pending, (state) => {
        state.bookingLoading = true;
        state.bookingError = null;
        state.bookingSuccess = false;
      })
      .addCase(bookEvent.fulfilled, (state) => {
        state.bookingLoading = false;
        state.bookingSuccess = true;
      })
      .addCase(bookEvent.rejected, (state, action) => {
        state.bookingLoading = false;
        state.bookingError = action.payload;
      })
      .addCase(fetchOrganizerEvents.fulfilled, (state, action) => {
        state.organizerEvents = action.payload;
      })
      .addCase(createEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.organizerEvents.unshift(action.payload);
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.organizerEvents.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.organizerEvents[index] = { ...state.organizerEvents[index], ...action.payload };
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.dashboard = action.payload;
      })
      .addCase(fetchAttendees.fulfilled, (state, action) => {
        state.attendees = action.payload;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload;
      });
  },
});

export const { clearEventError, clearBookingSuccess, clearCurrentEvent } = eventSlice.actions;
export default eventSlice.reducer;
