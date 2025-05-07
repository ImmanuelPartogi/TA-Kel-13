// src/router.jsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { isAuthenticated } from './services/auth';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import WelcomePage from './pages/welcome/WelcomePage';
import Login from './pages/auth/Login';
import Dashboard from './pages/operator/Dashboard';
import BookingList from './pages/operator/bookings/BookingList';
import BookingDetail from './pages/operator/bookings/BookingDetail';
import CheckIn from './pages/operator/bookings/CheckIn';
import ScheduleList from './pages/operator/schedules/ScheduleList';
import ReportList from './pages/operator/reports/ReportList';

// Protected Route wrapper
const ProtectedRoute = ({ element }) => {
  return isAuthenticated() ? element : <Navigate to="/login" replace />;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <WelcomePage />
  },
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <Login />
      }
    ]
  },
  {
    path: '/operator',
    element: <ProtectedRoute element={<MainLayout />} />,
    children: [
      {
        path: '',
        element: <Navigate to="/operator/dashboard" replace />
      },
      {
        path: 'dashboard',
        element: <Dashboard />
      },
      {
        path: 'bookings',
        element: <BookingList />
      },
      {
        path: 'bookings/:id',
        element: <BookingDetail />
      },
      {
        path: 'bookings/check-in',
        element: <CheckIn />
      },
      {
        path: 'schedules',
        element: <ScheduleList />
      },
      {
        path: 'reports',
        element: <ReportList />
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);

export default router;