import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, clearAuth } from '../store/slices/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
    } catch {
      dispatch(clearAuth());
    }
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="text-xl font-bold text-gray-900">BookIt</span>
          </Link>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <Link to="/events" className="text-gray-600 hover:text-primary-600 font-medium transition-colors text-sm sm:text-base">
              Events
            </Link>
            {isAuthenticated && user?.role === 'USER' && (
              <Link to="/my-bookings" className="text-gray-600 hover:text-primary-600 font-medium transition-colors text-sm sm:text-base">
                My Bookings
              </Link>
            )}
            {isAuthenticated && user?.role === 'ORGANIZER' && (
              <>
                <Link to="/organizer/dashboard" className="text-gray-600 hover:text-primary-600 font-medium transition-colors text-sm sm:text-base">
                  Dashboard
                </Link>
                <Link to="/organizer/events" className="text-gray-600 hover:text-primary-600 font-medium transition-colors text-sm sm:text-base hidden sm:inline">
                  Events
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="hidden sm:block text-sm text-gray-600">
                  Hi, <span className="font-medium text-gray-900">{user?.name}</span>
                </span>
                <button onClick={handleLogout} className="btn-secondary text-sm">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
