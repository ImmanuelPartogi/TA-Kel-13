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

// Admin Pages - Components might need to be created

// Dummy imports for now - replace with actual components
const AdminDashboard = () => <div>Admin Dashboard</div>;
const AdminsList = () => <div>Admins List</div>;
const AdminCreate = () => <div>Admin Create</div>;
const AdminEdit = () => <div>Admin Edit</div>;
const AdminShow = () => <div>Admin Show</div>;
const AdminBookingList = () => <div>Admin Booking List</div>;
const AdminBookingShow = () => <div>Admin Booking Show</div>;
const AdminReportIndex = () => <div>Admin Report Index</div>;
const BookingReport = () => <div>Booking Report</div>;
const RevenueReport = () => <div>Revenue Report</div>;
const ScheduleReport = () => <div>Schedule Report</div>;
const FerryList = () => <div>Ferry List</div>;
const FerryCreate = () => <div>Ferry Create</div>;
const FerryEdit = () => <div>Ferry Edit</div>;
const FerryShow = () => <div>Ferry Show</div>;
const RouteList = () => <div>Route List</div>;
const RouteCreate = () => <div>Route Create</div>;
const RouteEdit = () => <div>Route Edit</div>;
const RouteShow = () => <div>Route Show</div>;
const AdminScheduleList = () => <div>Admin Schedule List</div>;
const ScheduleCreate = () => <div>Schedule Create</div>;
const ScheduleEdit = () => <div>Schedule Edit</div>;
const AdminScheduleShow = () => <div>Admin Schedule Show</div>;
const AdminScheduleDatesList = () => <div>Admin Schedule Dates List</div>;
const AdminScheduleCreateDate = () => <div>Admin Schedule Create Date</div>;
const RefundsList = () => <div>Refunds List</div>;
const RefundCreate = () => <div>Refund Create</div>;
const RefundShow = () => <div>Refund Show</div>;
const OperatorList = () => <div>Operator List</div>;
const OperatorCreate = () => <div>Operator Create</div>;
const OperatorEdit = () => <div>Operator Edit</div>;
const OperatorShow = () => <div>Operator Show</div>;
const UserList = () => <div>User List</div>;
const UserShow = () => <div>User Show</div>;
const UserEdit = () => <div>User Edit</div>;

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