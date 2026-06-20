import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAttendees } from '../../store/slices/eventSlice';
import Sidebar from '../../components/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

const Attendees = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { attendees } = useSelector((state) => state.events);

  useEffect(() => {
    dispatch(fetchAttendees(id));
  }, [dispatch, id]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col lg:flex-row">
      <Sidebar />
      <div className="flex-1 p-6 lg:p-8">
        <Link to="/organizer/events" className="text-primary-600 text-sm font-medium hover:underline mb-4 inline-block">
          &larr; Back to Events
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendees</h1>
        <p className="text-gray-500 mb-8">View confirmed bookings for this event</p>

        {!attendees ? (
          <LoadingSpinner className="py-20" />
        ) : attendees.length === 0 ? (
          <EmptyState title="No attendees yet" description="No confirmed bookings for this event." />
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 text-sm font-semibold text-gray-600">Name</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Email</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Booking Date</th>
                </tr>
              </thead>
              <tbody>
                {attendees.map((attendee) => (
                  <tr key={attendee.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-4 font-medium text-gray-900">{attendee.name}</td>
                    <td className="py-4 text-gray-600">{attendee.email}</td>
                    <td className="py-4 text-gray-600 text-sm">{formatDate(attendee.bookingDate)}</td>
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

export default Attendees;
