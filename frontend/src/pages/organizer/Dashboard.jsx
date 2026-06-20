import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboard } from '../../store/slices/eventSlice';
import Sidebar from '../../components/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';

const OrganizerDashboard = () => {
  const dispatch = useDispatch();
  const { dashboard } = useSelector((state) => state.events);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  const stats = dashboard || { totalEvents: 0, totalBookings: 0, totalRevenue: 0 };

  return (
    <div className="flex flex-col lg:flex-row">
      <Sidebar />
      <div className="flex-1 p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-500 mb-8">Overview of your events and bookings</p>

        {!dashboard ? (
          <LoadingSpinner className="py-20" />
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="card cursor-pointer" onClick={() => window.location.assign('/organizer/insights/total-events')}>
                <p className="text-sm text-gray-500 mb-1">Total Events</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalEvents}</p>
              </div>
              <div className="card cursor-pointer" onClick={() => window.location.assign('/organizer/insights/total-bookings')}>
                <p className="text-sm text-gray-500 mb-1">Total Bookings</p>
                <p className="text-3xl font-bold text-primary-600">{stats.totalBookings}</p>
              </div>
              <div className="card cursor-pointer" onClick={() => window.location.assign('/organizer/insights/revenue-overview')}>
                <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">${stats.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="card cursor-pointer" onClick={() => window.location.assign('/organizer/insights/sold-out-events')}>
                <p className="text-sm text-gray-500 mb-1">Sold Out Events</p>
                <p className="text-3xl font-bold text-red-600">{stats.soldOutEvents ?? 0}</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3 mb-8">
              <div className="card cursor-pointer" onClick={() => window.location.assign('/organizer/insights/upcoming-events')}>
                <p className="text-sm text-gray-500 mb-1">Upcoming Events</p>
                <p className="text-3xl font-bold text-gray-900">{stats.upcomingEvents ?? 0}</p>
              </div>
              <div className="card">
                <p className="text-sm text-gray-500 mb-1">Avg Revenue / Event</p>
                <p className="text-3xl font-bold text-green-600">${(stats.averageRevenuePerEvent ?? 0).toFixed(2)}</p>
              </div>
              <div className="card">
                <p className="text-sm text-gray-500 mb-1">Avg Bookings / Event</p>
                <p className="text-3xl font-bold text-primary-600">{(stats.averageBookingsPerEvent ?? 0).toFixed(1)}</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2 mb-8">
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h2>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Overall Conversion</span>
                    <strong className="text-lg text-primary-600">{(stats.overallConversionRate ?? 0).toFixed(2)}%</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Top Event</span>
                    <span className="text-sm text-gray-900">{stats.topEvent?.title ?? 'No events yet'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Top Revenue</span>
                    <strong className="text-lg text-green-600">${(stats.topEvent?.revenue ?? 0).toFixed(2)}</strong>
                  </div>
                </div>
              </div>

              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-3">
                  <Link to="/organizer/create-event" className="btn-primary">Create Event</Link>
                  <Link to="/organizer/events" className="btn-secondary">View Events</Link>
                  <Link to="/organizer/analytics" className="btn-secondary">View Analytics</Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrganizerDashboard;
