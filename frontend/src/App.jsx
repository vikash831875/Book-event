import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import EventListing from './pages/EventListing';
import EventDetails from './pages/EventDetails';
import MyBookings from './pages/MyBookings';
import OrganizerDashboard from './pages/organizer/Dashboard';
import CreateEvent from './pages/organizer/CreateEvent';
import EditEvent from './pages/organizer/EditEvent';
import OrganizerEvents from './pages/organizer/OrganizerEvents';
import Attendees from './pages/organizer/Attendees';
import Analytics from './pages/organizer/Analytics';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/events" element={<EventListing />} />
        <Route path="/events/:id" element={<EventDetails />} />

        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute roles={['USER']}>
              <MyBookings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/organizer/dashboard"
          element={
            <ProtectedRoute roles={['ORGANIZER']}>
              <OrganizerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/create-event"
          element={
            <ProtectedRoute roles={['ORGANIZER']}>
              <CreateEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/events"
          element={
            <ProtectedRoute roles={['ORGANIZER']}>
              <OrganizerEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/events/:id/edit"
          element={
            <ProtectedRoute roles={['ORGANIZER']}>
              <EditEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/events/:id/attendees"
          element={
            <ProtectedRoute roles={['ORGANIZER']}>
              <Attendees />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/analytics"
          element={
            <ProtectedRoute roles={['ORGANIZER']}>
              <Analytics />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
