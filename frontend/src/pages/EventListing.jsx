import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvents } from '../store/slices/eventSlice';
import EventCard from '../components/EventCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';

const EventListing = () => {
  const dispatch = useDispatch();
  const { events, pagination, loading, error } = useSelector((state) => state.events);
  const [search, setSearch] = useState('');
  const [date, setDate] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchEvents({ search, date, page, limit: 9 }));
  }, [dispatch, search, date, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    dispatch(fetchEvents({ search, date, page: 1, limit: 9 }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upcoming Events</h1>
        <p className="text-gray-500">Discover and book your next experience</p>
      </div>

      <form onSubmit={handleSearch} className="card mb-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search by title</label>
            <input
              type="text"
              className="input-field"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by date</label>
            <input
              type="date"
              className="input-field"
              value={date}
              onChange={(e) => { setDate(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex items-end">
            <button type="submit" className="btn-primary w-full">Search</button>
          </div>
        </div>
      </form>

      {loading && <LoadingSpinner className="py-20" />}

      {error && (
        <ErrorMessage
          message={error}
          onRetry={() => dispatch(fetchEvents({ search, date, page, limit: 9 }))}
        />
      )}

      {!loading && !error && events.length === 0 && (
        <EmptyState
          title="No events found"
          description="Try adjusting your search or filter criteria."
        />
      )}

      {!loading && !error && events.length > 0 && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
};

export default EventListing;
