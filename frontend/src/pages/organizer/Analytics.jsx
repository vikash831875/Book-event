import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrganizerEvents, fetchAnalytics } from '../../store/slices/eventSlice';
import Sidebar from '../../components/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

const Analytics = () => {
  const dispatch = useDispatch();
  const { organizerEvents, analytics } = useSelector((state) => state.events);
  const [selectedEventId, setSelectedEventId] = useState('');

  useEffect(() => {
    dispatch(fetchOrganizerEvents());
  }, [dispatch]);

  useEffect(() => {
    if (selectedEventId) {
      dispatch(fetchAnalytics(selectedEventId));
    }
  }, [dispatch, selectedEventId]);

  useEffect(() => {
    if (organizerEvents.length > 0 && !selectedEventId) {
      setSelectedEventId(organizerEvents[0].id);
    }
  }, [organizerEvents, selectedEventId]);

  return (
    <div className="flex flex-col lg:flex-row">
      <Sidebar />
      <div className="flex-1 p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-500 mb-8">Track event performance and conversion rates</p>

        {organizerEvents.length === 0 ? (
          <EmptyState title="No events" description="Create events to view analytics." />
        ) : (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Event</label>
              <select
                className="input-field max-w-md"
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
              >
                {organizerEvents.map((event) => (
                  <option key={event.id} value={event.id}>{event.title}</option>
                ))}
              </select>
            </div>

            {!analytics ? (
              <LoadingSpinner className="py-20" />
            ) : (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">{analytics.eventTitle}</h2>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="card">
                    <p className="text-sm text-gray-500 mb-1">Total Views</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics.totalViews}</p>
                  </div>
                  <div className="card">
                    <p className="text-sm text-gray-500 mb-1">Booking Started</p>
                    <p className="text-3xl font-bold text-amber-600">{analytics.bookingStarted}</p>
                  </div>
                  <div className="card">
                    <p className="text-sm text-gray-500 mb-1">Booking Confirmed</p>
                    <p className="text-3xl font-bold text-green-600">{analytics.bookingConfirmed}</p>
                  </div>
                  <div className="card">
                    <p className="text-sm text-gray-500 mb-1">Booking Cancelled</p>
                    <p className="text-3xl font-bold text-red-600">{analytics.bookingCancelled}</p>
                  </div>
                </div>

                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Conversion Rate</h3>
                  <p className="text-4xl font-bold text-primary-600">{analytics.conversionRate}%</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Confirmed Bookings / Total Views &times; 100
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;
