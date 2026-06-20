import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrganizerEvents } from '../../store/slices/eventSlice';
import Sidebar from '../../components/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

const OrganizerEvents = () => {
  const dispatch = useDispatch();
  const { organizerEvents, loading } = useSelector((state) => state.events);

  useEffect(() => {
    dispatch(fetchOrganizerEvents());
  }, [dispatch]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="flex flex-col lg:flex-row">
      <Sidebar />
      <div className="flex-1 p-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Events</h1>
            <p className="text-gray-500">Manage your created events</p>
          </div>
          <Link to="/organizer/create-event" className="btn-primary">Create Event</Link>
        </div>

        {loading && <LoadingSpinner className="py-20" />}

        {!loading && (organizerEvents || []).length === 0 && (
          <EmptyState
            title="No events yet"
            description="Create your first event to get started."
            action={<Link to="/organizer/create-event" className="btn-primary">Create Event</Link>}
          />
        )}

        {!loading && (organizerEvents || []).length > 0 && (
          <div className="card overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 text-sm font-semibold text-gray-600">Event Name</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Date</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Capacity</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Seats Sold</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Views</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Conversion</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Revenue</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {organizerEvents.map((event) => (
                  <tr key={event.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-4 font-medium text-gray-900">{event.title}</td>
                    <td className="py-4 text-gray-600 text-sm">{event.eventDate ? formatDate(event.eventDate) : 'TBD'}</td>
                    <td className="py-4 text-gray-600">{event.capacity ?? 0}</td>
                    <td className="py-4 text-gray-600">{event.seatsSold ?? 0}</td>
                    <td className="py-4 text-gray-600">{event.views ?? 0}</td>
                    <td className="py-4 text-gray-600">{event.conversionRate?.toFixed(2) ?? '0.00'}%</td>
                    <td className="py-4 font-medium text-green-600">${Number(event.revenue ?? 0).toFixed(2)}</td>
                    <td className="py-4">
                      <div className="flex gap-2">
                        <Link to={`/organizer/events/${event.id}/edit`} className="text-primary-600 text-sm font-medium hover:underline">
                          Edit
                        </Link>
                        <Link to={`/organizer/events/${event.id}/attendees`} className="text-primary-600 text-sm font-medium hover:underline">
                          Attendees
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerEvents;
