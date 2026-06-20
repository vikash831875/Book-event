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

                <div className="grid gap-6 lg:grid-cols-3 mb-8">
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Conversion Rate</h3>
                    <p className="text-4xl font-bold text-primary-600">{analytics.conversionRate}%</p>
                    <p className="text-sm text-gray-500 mt-2">Confirmed Bookings / Total Views × 100</p>
                  </div>
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Revenue</h3>
                    <p className="text-4xl font-bold text-green-600">${(analytics.revenue ?? 0).toFixed(2)}</p>
                    <p className="text-sm text-gray-500 mt-2">Confirmed bookings × ticket price</p>
                  </div>
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Capacity Filled</h3>
                    <p className="text-4xl font-bold text-gray-900">{analytics.bookingRate ?? 0}%</p>
                    <p className="text-sm text-gray-500 mt-2">Booked seats / total capacity</p>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Event Details</h3>
                    <dl className="grid gap-3 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Venue</span>
                        <span className="font-medium text-gray-900">{analytics.venue}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Date</span>
                        <span className="font-medium text-gray-900">{new Date(analytics.eventDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Capacity</span>
                        <span className="font-medium text-gray-900">{analytics.capacity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Price</span>
                        <span className="font-medium text-gray-900">${analytics.price?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Seats Sold</span>
                        <span className="font-medium text-gray-900">{analytics.seatsSold}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Seats Remaining</span>
                        <span className="font-medium text-gray-900">{analytics.remainingSeats}</span>
                      </div>
                    </dl>
                  </div>

                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Insights</h3>
                    <ul className="space-y-3 text-sm text-gray-600">
                      <li>
                        <strong className="text-gray-900">{analytics.totalViews}</strong> views across this event.
                      </li>
                      <li>
                        <strong className="text-gray-900">{analytics.bookingStarted}</strong> users began checkout.
                      </li>
                      <li>
                        <strong className="text-gray-900">{analytics.bookingConfirmed}</strong> confirmed bookings.
                      </li>
                      <li>
                        <strong className="text-gray-900">{analytics.bookingCancelled}</strong> cancellations.
                      </li>
                    </ul>
                  </div>
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
