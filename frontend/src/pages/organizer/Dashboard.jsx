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
            <div className="grid sm:grid-cols-3 gap-6 mb-8">
              <div className="card">
                <p className="text-sm text-gray-500 mb-1">Total Events</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalEvents}</p>
              </div>
              <div className="card">
                <p className="text-sm text-gray-500 mb-1">Total Bookings</p>
                <p className="text-3xl font-bold text-primary-600">{stats.totalBookings}</p>
              </div>
              <div className="card">
                <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">${stats.totalRevenue.toFixed(2)}</p>
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
          </>
        )}
      </div>
    </div>
  );
};

export default OrganizerDashboard;
