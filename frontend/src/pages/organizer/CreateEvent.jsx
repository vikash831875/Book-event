import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createEvent } from '../../store/slices/eventSlice';
import Sidebar from '../../components/Sidebar';
import ErrorMessage from '../../components/ErrorMessage';
import LoadingSpinner from '../../components/LoadingSpinner';

const CreateEvent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.events);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      await dispatch(createEvent({
        ...data,
        capacity: parseInt(data.capacity),
        price: parseFloat(data.price),
      })).unwrap();
      navigate('/organizer/events');
    } catch {
      // error handled by slice
    }
  };

  return (
    <div className="flex flex-col lg:flex-row">
      <Sidebar />
      <div className="flex-1 p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Event</h1>
        <p className="text-gray-500 mb-8">Fill in the details for your new event</p>

        <div className="card max-w-2xl">
          <ErrorMessage message={error} />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                className="input-field"
                {...register('title', { required: 'Title is required' })}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows={4}
                className="input-field"
                {...register('description', { required: 'Description is required' })}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
              <input
                type="text"
                className="input-field"
                {...register('venue', { required: 'Venue is required' })}
              />
              {errors.venue && <p className="text-red-500 text-sm mt-1">{errors.venue.message}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
                <input
                  type="datetime-local"
                  className="input-field"
                  {...register('eventDate', { required: 'Event date is required' })}
                />
                {errors.eventDate && <p className="text-red-500 text-sm mt-1">{errors.eventDate.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <input
                  type="number"
                  min="1"
                  className="input-field"
                  {...register('capacity', {
                    required: 'Capacity is required',
                    min: { value: 1, message: 'Capacity must be greater than 0' },
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
                {...register('price', {
                  required: 'Price is required',
                  min: { value: 0, message: 'Price must be 0 or greater' },
                })}
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
            </div>

            <div className="flex gap-3 pt-4">
              <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                {loading ? <LoadingSpinner size="sm" /> : 'Create Event'}
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

export default CreateEvent;
