import { createBrowserRouter, Navigate } from 'react-router-dom';
import { isAuthenticated } from './services/auth';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';

// Auth Pages
import AdminLogin from './pages/auth/AdminLogin';
import OperatorLogin from './pages/auth/OperatorLogin';
import WelcomePage from './pages/welcome/WelcomePage';

// Operator Pages
import Login from './pages/auth/Login';
import Dashboard from './pages/operator/Dashboard';
import BookingList from './pages/operator/bookings/BookingList';
import BookingShow from './pages/operator/bookings/BookingShow';
import BookingCheckIn from './pages/operator/bookings/BookingCheckIn';
import SchedulesList from './pages/operator/schedules/SchedulesList';
import ScheduleShow from './pages/operator/schedules/ScheduleShow';
import ScheduleCreateDate from './pages/operator/schedules/ScheduleCreateDate';
import ScheduleEditDate from './pages/operator/schedules/ScheduleEditDate';
import ScheduleDatesList from './pages/operator/schedules/ScheduleDatesList';
import OperatorDashboard from './pages/operator/Dashboard';


// Report Pages
import ReportIndex from './pages/admin/reports/ReportIndex';
import BookingReport from './pages/admin/reports/BookingReport';
import RevenueReport from './pages/admin/reports/RevenueReport';
import ScheduleReport from './pages/admin/reports/ScheduleReport';

// Admin Pages
import FerryList from './pages/admin/ferries/FerryList';
import FerryCreate from './pages/admin/ferries/FerryCreate';
import FerryEdit from './pages/admin/ferries/FerryEdit';
import FerryShow from './pages/admin/ferries/FerryShow';
import AdminDashboard from './pages/admin/Dashboard';

// Routes Pages
import RouteList from './pages/admin/routes/RouteList';
import RouteCreate from './pages/admin/routes/RouteCreate';
import RouteEdit from './pages/admin/routes/RouteEdit';
import RouteShow from './pages/admin/routes/RouteShow';

// Refund Pages
import RefundsList from './pages/admin/refunds/RefundsList';
import RefundCreate from './pages/admin/refunds/RefundCreate';
import RefundShow from './pages/admin/refunds/RefundShow';

// Admin Operators Pages
import OperatorList from './pages/admin/operators/OperatorList';
import OperatorCreate from './pages/admin/operators/OperatorCreate';
import OperatorEdit from './pages/admin/operators/OperatorEdit';
import OperatorShow from './pages/admin/operators/OperatorShow';

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
        path: 'admin/login',
        element: <AdminLogin />
      },
      {
        path: 'operator/login',
        element: <OperatorLogin />
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
    path: '/admin',
    element: <ProtectedRoute element={<AdminLayout />} />,
    children: [
      {
        path: '',
        element: <Navigate to="/admin/dashboard" replace />
      },
      // Routes Management
      {
        path: 'routes',
        element: <RouteList />
      },
      {
        path: 'routes/create',
        element: <RouteCreate />
      },
      {
        path: 'routes/:id',
        element: <RouteShow />
      },
      {
        path: 'routes/:id/edit',
        element: <RouteEdit />
      },
      // Ferries Management
      {
        path: 'ferries',
        element: <FerryList />
      },
      {
        path: 'ferries/create',
        element: <FerryCreate />
      },
      {
        path: 'ferries/:id',
        element: <FerryShow />
      },
      {
        path: 'ferries/:id/edit',
        element: <FerryEdit />
      },
      // Refunds Management
      {
        path: 'refunds',
        element: <RefundsList />
      },
      {
        path: 'refunds/:id',
        element: <RefundShow />
      },
      {
        path: 'bookings/:bookingId/refund/create',
        element: <RefundCreate />
      },
      // Operators Management
      {
        path: 'operators',
        element: <OperatorList />
      },
      {
        path: 'operators/create',
        element: <OperatorCreate />
      },
      {
        path: 'operators/:id',
        element: <OperatorShow />
      },
      {
        path: 'operators/:id/edit',
        element: <OperatorEdit />
      },
      // Report Routes
      {
        path: 'reports',
        element: <ReportIndex />
      },
      {
        path: 'reports/booking',
        element: <BookingReport />
      },
      {
        path: 'reports/revenue',
        element: <RevenueReport />
      },
      {
        path: 'reports/schedule',
        element: <ScheduleReport />
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);

export default router;