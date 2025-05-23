// src/router.jsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { isAuthenticated, isAdmin, isOperator } from './services/auth';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';
import OperatorLayout from './layouts/OperatorLayout';

// Auth Pages
import AdminLogin from './pages/admin/auth/Login';
import OperatorLogin from './pages/operator/auth/Login';
import WelcomePage from './pages/welcome/WelcomePage';

// Operator Pages
import OperatorDashboard from './pages/operator/Dashboard';
import BookingList from './pages/operator/bookings/BookingList';
import BookingShow from './pages/operator/bookings/BookingShow';
import BookingCheckIn from './pages/operator/bookings/BookingCheckIn';
import SchedulesList from './pages/operator/schedules/SchedulesList';
import ScheduleShow from './pages/operator/schedules/ScheduleShow';
import ScheduleCreateDate from './pages/operator/schedules/ScheduleCreateDate';
import ScheduleEditDate from './pages/operator/schedules/ScheduleEditDate';
import ScheduleDatesList from './pages/operator/schedules/ScheduleDatesList';
import DailyReport from './pages/operator/reports/DailyReport';
import MonthlyReport from './pages/operator/reports/MonthlyReport';
import ReportIndex from './pages/operator/reports/ReportIndex';

// Admin Pages - Import actual components
import AdminDashboard from './pages/admin/Dashboard';
import AdminsList from './pages/admin/admins/AdminsList';
import AdminCreate from './pages/admin/admins/AdminCreate';
import AdminEdit from './pages/admin/admins/AdminEdit';
import AdminShow from './pages/admin/admins/AdminShow';
import AdminBookingList from './pages/admin/bookings/BookingsList';
import AdminBookingShow from './pages/admin/bookings/BookingShow';
import AdminReportIndex from './pages/admin/reports/ReportIndex';
import BookingReport from './pages/admin/reports/BookingReport';
import RevenueReport from './pages/admin/reports/RevenueReport';
import ScheduleReport from './pages/admin/reports/ScheduleReport';
import FerryList from './pages/admin/ferries/FerryList';
import FerryCreate from './pages/admin/ferries/FerryCreate';
import FerryEdit from './pages/admin/ferries/FerryEdit';
import FerryShow from './pages/admin/ferries/FerryShow';
import RouteList from './pages/admin/routes/RouteList';
import RouteCreate from './pages/admin/routes/RouteCreate';
import RouteEdit from './pages/admin/routes/RouteEdit';
import RouteShow from './pages/admin/routes/RouteShow';
import AdminScheduleList from './pages/admin/schedules/SchedulesList';
import ScheduleCreate from './pages/admin/schedules/ScheduleCreate';
import ScheduleEdit from './pages/admin/schedules/ScheduleEdit';
import AdminScheduleShow from './pages/admin/schedules/ScheduleShow';
import AdminScheduleDatesList from './pages/admin/schedules/ScheduleDatesList';
import AdminScheduleCreateDate from './pages/admin/schedules/ScheduleCreateDate';

// Import Refund Components
import RefundsList from './pages/admin/refunds/RefundsList';
import RefundCreate from './pages/admin/refunds/RefundCreate';
import RefundShow from './pages/admin/refunds/RefundShow';
import RefundPolicySettings from './pages/admin/refunds/RefundPolicySettings';

import OperatorList from './pages/admin/operators/OperatorList';
import OperatorCreate from './pages/admin/operators/OperatorCreate';
import OperatorEdit from './pages/admin/operators/OperatorEdit';
import OperatorShow from './pages/admin/operators/OperatorShow';
import UserList from './pages/admin/users/UsersList';
import UserShow from './pages/admin/users/UserShow';
import UserEdit from './pages/admin/users/UserEdit';

// Protected Route Components
const AdminProtectedRoute = ({ element }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin()) {
    return <Navigate to="/admin/login" replace />;
  }

  return element;
};

const OperatorProtectedRoute = ({ element }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/operator/login" replace />;
  }

  if (!isOperator()) {
    return <Navigate to="/operator/login" replace />;
  }

  return element;
};

const router = createBrowserRouter([
  // Public Routes
  {
    path: '/',
    element: <WelcomePage />
  },
  
  // Auth Routes
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
  
  // Operator Routes (Protected)
  {
    path: '/operator',
    element: <OperatorProtectedRoute element={<OperatorLayout />} />,
    children: [
      {
        path: '',
        element: <Navigate to="/operator/dashboard" replace />
      },
      {
        path: 'dashboard',
        element: <OperatorDashboard />
      },
      
      // Bookings
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
      
      // Schedules
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
      
      // Reports
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
  
  // Admin Routes (Protected)
  {
    path: '/admin',
    element: <AdminProtectedRoute element={<AdminLayout />} />,
    children: [
      {
        path: '',
        element: <Navigate to="/admin/dashboard" replace />
      },
      {
        path: 'dashboard',
        element: <AdminDashboard />
      },
      
      // Admin Management
      {
        path: 'admins',
        element: <AdminsList />
      },
      {
        path: 'admins/create',
        element: <AdminCreate />
      },
      {
        path: 'admins/:id',
        element: <AdminShow />
      },
      {
        path: 'admins/:id/edit',
        element: <AdminEdit />
      },
      
      // User Management
      {
        path: 'users',
        element: <UserList />
      },
      {
        path: 'users/:id',
        element: <UserShow />
      },
      {
        path: 'users/:id/edit',
        element: <UserEdit />
      },
      
      // Operator Management
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
      
      // Schedules Management
      {
        path: 'schedules',
        element: <AdminScheduleList />
      },
      {
        path: 'schedules/create',
        element: <ScheduleCreate />
      },
      {
        path: 'schedules/:id',
        element: <AdminScheduleShow />
      },
      {
        path: 'schedules/:id/edit',
        element: <ScheduleEdit />
      },
      {
        path: 'schedules/:id/dates',
        element: <AdminScheduleDatesList />
      },
      {
        path: 'schedules/:id/dates/create',
        element: <AdminScheduleCreateDate />
      },
      
      // Bookings Management
      {
        path: 'bookings',
        element: <AdminBookingList />
      },
      {
        path: 'bookings/:id',
        element: <AdminBookingShow />
      },
      {
        path: 'bookings/:id/reschedule',
        element: <Navigate to="/admin/bookings/:id" replace />
      },
      
      // Reports
      {
        path: 'reports',
        element: <AdminReportIndex />
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
      },
      
      // *** REFUNDS MANAGEMENT - FIXED ORDER ***
      // IMPORTANT: Specific routes MUST come before parameterized routes
      {
        path: 'refunds',
        element: <RefundsList />
      },
      {
        path: 'refunds/settings', // This MUST come before 'refunds/:id'
        element: <RefundPolicySettings />
      },
      {
        path: 'bookings/:bookingId/refund/create',
        element: <RefundCreate />
      },
      {
        path: 'refunds/:id', // This comes AFTER specific routes
        element: <RefundShow />
      }
    ]
  },
  
  // Fallback Route
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);

export default router;