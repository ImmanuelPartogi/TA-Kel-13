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
import BookingShow from './pages/operator/bookings/BookingShow';
import BookingCheckIn from './pages/operator/bookings/BookingCheckIn';
import SchedulesList from './pages/operator/schedules/SchedulesList';
import ScheduleShow from './pages/operator/schedules/ScheduleShow';
import ScheduleCreateDate from './pages/operator/schedules/ScheduleCreateDate';
import ScheduleEditDate from './pages/operator/schedules/ScheduleEditDate';

// Report Pages
import ReportIndex from './pages/operator/reports/ReportIndex';
import DailyReport from './pages/operator/reports/DailyReport';
import MonthlyReport from './pages/operator/reports/MonthlyReport';

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
      // Bookings Routes
      {
        path: 'bookings',
        element: <BookingList />
      },
      {
        path: 'bookings/:id',
        element: <BookingShow />
      },
      {
        path: 'bookings/check-in',
        element: <BookingCheckIn />
      },
      // Schedules Routes
      {
        path: 'schedules',
        element: <SchedulesList />
      },
      {
        path: 'schedules/:id',
        element: <ScheduleShow />
      },
      {
        path: 'schedules/:id/dates',
        element: <ScheduleDatesList />
      },
      {
        path: 'schedules/:id/dates/create',
        element: <ScheduleCreateDate />
      },
      {
        path: 'schedules/:scheduleId/dates/:dateId/edit',
        element: <ScheduleEditDate />
      },
      // Reports Routes
      {
        path: 'reports',
        element: <ReportIndex />
      },
      {
        path: 'reports/daily',
        element: <DailyReport />
      },
      {
        path: 'reports/monthly',
        element: <MonthlyReport />
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);

export default router;