import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrganizerEvents, updateEvent } from '../../store/slices/eventSlice';
import Sidebar from '../../components/Sidebar';
import ErrorMessage from '../../components/ErrorMessage';
import LoadingSpinner from '../../components/LoadingSpinner';

const EditEvent = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { organizerEvents, loading, error } = useSelector((state) => state.events);
  const event = organizerEvents.find((e) => e.id === id);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (organizerEvents.length === 0) {
      dispatch(fetchOrganizerEvents());
    }
  }, [dispatch, organizerEvents.length]);

  useEffect(() => {
    if (event) {
      const eventDate = new Date(event.eventDate);
      const localDate = new Date(eventDate.getTime() - eventDate.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

      reset({
        title: event.title,
        description: event.description,
        venue: event.venue,
        eventDate: localDate,
        capacity: event.capacity,
        price: event.price,
      });
    }
  }, [event, reset]);

  const onSubmit = async (data) => {
    try {
      await dispatch(updateEvent({
        id,
        data: {
          ...data,
          capacity: parseInt(data.capacity),
          price: parseFloat(data.price),
        },
      })).unwrap();
      navigate('/organizer/events');
    } catch {
      // error handled by slice
    }
  };

  if (!event && organizerEvents.length === 0) {
    return (
      <div className="flex flex-col lg:flex-row">
        <Sidebar />
        <div className="flex-1 p-8"><LoadingSpinner className="py-20" /></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col lg:flex-row">
        <Sidebar />
        <div className="flex-1 p-8">
          <ErrorMessage message="Event not found" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row">
      <Sidebar />
      <div className="flex-1 p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Event</h1>
        <p className="text-gray-500 mb-2">Update event details</p>
        <p className="text-sm text-amber-600 mb-8">
          Seats sold: {event.seatsSold}. Capacity cannot be lower than this value.
        </p>

        <div className="card max-w-2xl">
          <ErrorMessage message={error} />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input type="text" className="input-field" {...register('title', { required: 'Title is required' })} />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea rows={4} className="input-field" {...register('description', { required: 'Description is required' })} />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
              <input type="text" className="input-field" {...register('venue', { required: 'Venue is required' })} />
              {errors.venue && <p className="text-red-500 text-sm mt-1">{errors.venue.message}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
                <input type="datetime-local" className="input-field" {...register('eventDate', { required: 'Event date is required' })} />
                {errors.eventDate && <p className="text-red-500 text-sm mt-1">{errors.eventDate.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <input
                  type="number"
                  min={event.seatsSold}
                  className="input-field"
                  {...register('capacity', {
                    required: 'Capacity is required',
                    min: { value: event.seatsSold, message: `Minimum capacity is ${event.seatsSold}` },
                  })}
                />
                {errors.capacity && <p className="text-red-500 text-sm mt-1">{errors.capacity.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="input-field"
                {...register('price', { required: 'Price is required', min: { value: 0, message: 'Price must be 0 or greater' } })}
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
            </div>

            <div className="flex gap-3 pt-4">
              <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                {loading ? <LoadingSpinner size="sm" /> : 'Save Changes'}
              </button>
              <button type="button" onClick={() => navigate('/organizer/events')} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditEvent;
