import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { fetchOrganizerEvents } from '../../store/slices/eventSlice';
import Sidebar from '../../components/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

const metricConfig = {
  'total-events': { title: 'All Events', subtitle: 'All created events' },
  'upcoming-events': { title: 'Upcoming Events', subtitle: 'Events happening soon' },
  'total-bookings': { title: 'Bookings Overview', subtitle: 'Confirmed bookings by event' },
  'total-views': { title: 'Views Overview', subtitle: 'Event page views' },
  'sold-out-events': { title: 'Sold Out Events', subtitle: 'Events that are fully booked' },
  'revenue-overview': { title: 'Revenue Overview', subtitle: 'Highest earning events' },
};

const Insights = () => {
  const { metric } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { organizerEvents, loading } = useSelector((state) => state.events);

  useEffect(() => {
    dispatch(fetchOrganizerEvents());
  }, [dispatch]);

  const cfg = metricConfig[metric] || metricConfig['total-events'];

  const items = useMemo(() => {
    if (!organizerEvents) return [];

    const now = new Date();

    switch (metric) {
      case 'upcoming-events':
        return organizerEvents.filter((e) => new Date(e.eventDate) >= now).sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
      case 'sold-out-events':
        return organizerEvents.filter((e) => (e.seatsSold ?? 0) >= (e.capacity ?? 0));
      case 'total-bookings':
        return organizerEvents.slice().sort((a, b) => (b.seatsSold || 0) - (a.seatsSold || 0));
      case 'revenue-overview':
        return organizerEvents.slice().sort((a, b) => (b.revenue || 0) - (a.revenue || 0));
      case 'total-views':
        return organizerEvents.slice().sort((a, b) => (b.views || 0) - (a.views || 0));
      case 'total-events':
      default:
        return organizerEvents.slice().sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));
    }
  }, [organizerEvents, metric]);

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-6 lg:p-8">
          <LoadingSpinner className="py-20" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row">
      <Sidebar />
      <div className="flex-1 p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{cfg.title}</h1>
            <p className="text-gray-500">{cfg.subtitle}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate(-1)} className="btn-secondary">Back</button>
            <Link to="/organizer/events" className="btn-primary">Manage Events</Link>
          </div>
        </div>

        {(!items || items.length === 0) && (
          <EmptyState title="No results" description="No events match this view." />
        )}

        {items && items.length > 0 && (
          <div className="card overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 text-sm font-semibold text-gray-600">Event</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Date</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Capacity</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Seats Sold</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Views</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Revenue</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((e) => (
                  <tr key={e.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-4 font-medium text-gray-900">{e.title}</td>
                    <td className="py-4 text-gray-600 text-sm">{e.eventDate ? new Date(e.eventDate).toLocaleString() : 'TBD'}</td>
                    <td className="py-4 text-gray-600">{e.capacity ?? 0}</td>
                    <td className="py-4 text-gray-600">{e.seatsSold ?? 0}</td>
                    <td className="py-4 text-gray-600">{e.views ?? 0}</td>
                    <td className="py-4 font-medium text-green-600">${Number(e.revenue ?? 0).toFixed(2)}</td>
                    <td className="py-4">
                      <div className="flex gap-2">
                        <Link to={`/organizer/events/${e.id}/attendees`} className="text-primary-600 text-sm font-medium hover:underline">Attendees</Link>
                        <Link to={`/organizer/events/${e.id}/edit`} className="text-primary-600 text-sm font-medium hover:underline">Edit</Link>
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

export default Insights;
