import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyBookings, cancelBooking, clearBookingError } from '../store/slices/bookingSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

const MyBookings = () => {
  const dispatch = useDispatch();
  const { bookings, loading, error, cancelLoading, cancelError } = useSelector(
    (state) => state.bookings
  );

  useEffect(() => {
    dispatch(fetchMyBookings());
  }, [dispatch]);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    dispatch(clearBookingError());
    try {
      await dispatch(cancelBooking(id)).unwrap();
    } catch {
      // error handled by slice
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
      <p className="text-gray-500 mb-8">Manage your event reservations</p>

      <ErrorMessage message={cancelError} />

      {loading && <LoadingSpinner className="py-20" />}

      {error && (
        <ErrorMessage message={error} onRetry={() => dispatch(fetchMyBookings())} />
      )}

      {!loading && !error && bookings.length === 0 && (
        <EmptyState
          title="No bookings yet"
          description="Browse events and book your first experience!"
          action={
            <Link to="/events" className="btn-primary">
              Browse Events
            </Link>
          }
        />
      )}

      {!loading && !error && bookings.length > 0 && (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">{booking.event.title}</h3>
                <p className="text-gray-500 text-sm mt-1">{booking.event.venue}</p>
                <p className="text-gray-500 text-sm">{formatDate(booking.event.eventDate)}</p>
                <span
                  className={`inline-block mt-2 text-xs font-semibold px-2 py-1 rounded-full ${
                    booking.status === 'CONFIRMED'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {booking.status}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xl font-bold text-primary-600">${booking.event.price}</span>
                {booking.status === 'CONFIRMED' && (
                  <button
                    onClick={() => handleCancel(booking.id)}
                    disabled={cancelLoading}
                    className="btn-danger text-sm"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
