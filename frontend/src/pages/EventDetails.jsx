import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchEventById,
  bookEvent,
  clearEventError,
  clearBookingSuccess,
  clearCurrentEvent,
} from '../store/slices/eventSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const EventDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const {
    currentEvent,
    loading,
    error,
    bookingLoading,
    bookingError,
    bookingSuccess,
  } = useSelector((state) => state.events);

  useEffect(() => {
    dispatch(fetchEventById(id));
    return () => {
      dispatch(clearCurrentEvent());
      dispatch(clearBookingSuccess());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (bookingSuccess) {
      navigate('/my-bookings');
    }
  }, [bookingSuccess, navigate]);

  const handleBook = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }

    if (user?.role !== 'USER') {
      return;
    }

    dispatch(clearEventError());
    try {
      await dispatch(bookEvent(id)).unwrap();
    } catch {
      // error handled by slice
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <LoadingSpinner className="py-20" />;
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <ErrorMessage message={error} onRetry={() => dispatch(fetchEventById(id))} />
        <Link to="/events" className="btn-secondary mt-4 inline-block">Back to Events</Link>
      </div>
    );
  }

  if (!currentEvent) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/events" className="text-primary-600 text-sm font-medium hover:underline mb-6 inline-block">
        &larr; Back to Events
      </Link>

      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentEvent.title}</h1>
            <p className="text-gray-500">by {currentEvent.organizer?.name}</p>
          </div>
          {currentEvent.isSoldOut && (
            <span className="bg-red-100 text-red-700 font-semibold px-4 py-2 rounded-full">
              Sold Out
            </span>
          )}
        </div>

        <p className="text-gray-700 leading-relaxed mb-8">{currentEvent.description}</p>

        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Venue</p>
            <p className="font-semibold text-gray-900">{currentEvent.venue}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Date & Time</p>
            <p className="font-semibold text-gray-900">{formatDate(currentEvent.eventDate)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Price</p>
            <p className="font-semibold text-primary-600 text-2xl">${currentEvent.price}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Remaining Seats</p>
            <p className="font-semibold text-gray-900">
              {currentEvent.remainingSeats} of {currentEvent.capacity}
            </p>
          </div>
        </div>

        <ErrorMessage message={bookingError} />

        {user?.role === 'USER' && (
          <button
            onClick={handleBook}
            disabled={currentEvent.isSoldOut || bookingLoading}
            className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
          >
            {bookingLoading ? (
              <LoadingSpinner size="sm" />
            ) : currentEvent.isSoldOut ? (
              'Sold Out'
            ) : (
              'Book One Seat'
            )}
          </button>
        )}

        {!isAuthenticated && (
          <p className="text-gray-500 text-sm mt-4">
            <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
            {' '}to book this event.
          </p>
        )}
      </div>
    </div>
  );
};

export default EventDetails;
