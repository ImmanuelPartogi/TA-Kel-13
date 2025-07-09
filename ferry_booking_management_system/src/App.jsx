import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Public pages
import Welcome from './pages/Welcome';
import Login from './pages/auth/Login';
import AdminLogin from './pages/admin/auth/Login';
import OperatorLogin from './pages/operator/auth/Login';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import OperatorLayout from './layouts/OperatorLayout';  // Import OperatorLayout

// Admin pages - Routes
import AdminRouteList from './pages/admin/routes/RouteList';
import AdminRouteCreate from './pages/admin/routes/RouteCreate';
import AdminRouteEdit from './pages/admin/routes/RouteEdit';
import AdminRouteShow from './pages/admin/routes/RouteShow';

// Admin pages - Ferries
import AdminFerryList from './pages/admin/ferries/FerryList';
import AdminFerryCreate from './pages/admin/ferries/FerryCreate';
import AdminFerryEdit from './pages/admin/ferries/FerryEdit';
import AdminFerryShow from './pages/admin/ferries/FerryShow';

// Admin pages - Schedules
import AdminScheduleList from './pages/admin/schedules/SchedulesList';
import AdminScheduleCreate from './pages/admin/schedules/ScheduleCreate';
import AdminScheduleEdit from './pages/admin/schedules/ScheduleEdit';
import AdminScheduleShow from './pages/admin/schedules/ScheduleShow';
import AdminScheduleDates from './pages/admin/schedules/ScheduleDates';

// Admin pages - Bookings
import AdminBookingList from './pages/admin/bookings/BookingsList';
import AdminBookingReschedule from './pages/admin/bookings/BookingReschedule';
import AdminBookingShow from './pages/admin/bookings/BookingShow';
import AdminBookingCreate from './pages/admin/bookings/BookingCreate';

// Admin pages - Refunds
import AdminRefundList from './pages/admin/refunds/RefundsList';
import AdminRefundCreate from './pages/admin/refunds/RefundCreate';
import AdminRefundShow from './pages/admin/refunds/RefundShow';
import RefundPolicySettings from './pages/admin/refunds/RefundPolicySettings';

// Admin pages - Reports
import AdminReportIndex from './pages/admin/reports/ReportIndex';
import AdminBookingReport from './pages/admin/reports/BookingReport';
import AdminRevenueReport from './pages/admin/reports/RevenueReport';
import AdminScheduleReport from './pages/admin/reports/ScheduleReport';

// Admin pages - Operators
import AdminOperatorList from './pages/admin/operators/OperatorList';
import AdminOperatorCreate from './pages/admin/operators/OperatorCreate';
import AdminOperatorEdit from './pages/admin/operators/OperatorEdit';
import AdminOperatorShow from './pages/admin/operators/OperatorShow';

// Admin pages - Users
import AdminUsersList from './pages/admin/users/UsersList';
import AdminUsersEdit from './pages/admin/users/UserEdit';
import AdminUsersShow from './pages/admin/users/UserShow';

// Admin pages - Vehicle Categories
import VehicleCategoriesList from './pages/admin/vehicleCategories/VehicleCategoriesList';
import VehicleCategoriesCreate from './pages/admin/vehicleCategories/VehicleCategoriesCreate';
import VehicleCategoriesEdit from './pages/admin/vehicleCategories/VehicleCategoriesEdit';
import VehicleCategoriesShow from './pages/admin/vehicleCategories/VehicleCategoriesShow';

// Admin pages - Other
import AdminDashboard from './pages/admin/Dashboard';

// Operator pages
import OperatorDashboard from './pages/operator/Dashboard';

// Operator pages - Bookings
import OperatorBookingList from './pages/operator/bookings/BookingList';
import OperatorBookingCheckIn from './pages/operator/bookings/BookingCheckIn';
import OperatorBookingShow from './pages/operator/bookings/BookingShow';

// Operator pages - Reports
import OperatorReportIndex from './pages/operator/reports/ReportIndex';
import OperatorDailyReport from './pages/operator/reports/DailyReport';
import OperatorMonthlyReport from './pages/operator/reports/MonthlyReport';

// Operator pages - Schedules
import OperatorScheduleList from './pages/operator/schedules/SchedulesList';
import OperatorScheduleCreateDate from './pages/operator/schedules/ScheduleCreateDate';
import OperatorScheduleDates from './pages/operator/schedules/ScheduleDatesList';
import OperatorScheduleEditDate from './pages/operator/schedules/ScheduleEditDate';
import OperatorScheduleShow from './pages/operator/schedules/ScheduleShow';

// Protected Route Component - Updated
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Tampilkan loading saat cek authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Redirect ke login jika tidak authenticated
  if (!isAuthenticated) {
    // Redirect ke login yang sesuai dengan role
    const loginPath = location.pathname.startsWith('/operator')
      ? '/operator/login'
      : '/admin/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Cek role jika ada yang specified
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect ke halaman yang sesuai dengan role user
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user?.role === 'operator') {
      return <Navigate to="/operator/dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/operator/login" element={<OperatorLogin />} />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" />} />
          <Route path="dashboard" element={<AdminDashboard />} />

          {/* Routes management */}
          <Route path="routes" element={<AdminRouteList />} />
          <Route path="routes/create" element={<AdminRouteCreate />} />
          <Route path="routes/:id/edit" element={<AdminRouteEdit />} />
          <Route path="routes/:id" element={<AdminRouteShow />} />

          {/* Ferries management */}
          <Route path="ferries" element={<AdminFerryList />} />
          <Route path="ferries/create" element={<AdminFerryCreate />} />
          <Route path="ferries/:id/edit" element={<AdminFerryEdit />} />
          <Route path="ferries/:id" element={<AdminFerryShow />} />

          {/* Schedules management */}
          <Route path="schedules" element={<AdminScheduleList />} />
          <Route path="schedules/create" element={<AdminScheduleCreate />} />
          <Route path="schedules/:id/edit" element={<AdminScheduleEdit />} />
          <Route path="schedules/:id" element={<AdminScheduleShow />} />
          <Route path="schedules/:id/dates" element={<AdminScheduleDates />} />

          {/* Bookings management */}
          <Route path="bookings" element={<AdminBookingList />} />
          <Route path="bookings/:id/reschedule" element={<AdminBookingReschedule />} />
          <Route path="bookings/:id" element={<AdminBookingShow />} />
          <Route path="bookings/create" element={<AdminBookingCreate />} />

          {/* *** REFUNDS MANAGEMENT - FIXED ORDER *** */}
          {/* IMPORTANT: Specific routes MUST come before parameterized routes */}
          <Route path="refunds" element={<AdminRefundList />} />
          <Route path="refunds/settings" element={<RefundPolicySettings />} /> {/* This MUST come before refunds/:id */}
          <Route path="refunds/create/:bookingId" element={<AdminRefundCreate />} />
          <Route path="refunds/:id" element={<AdminRefundShow />} /> {/* This comes AFTER specific routes */}

          {/* Reports */}
          <Route path="reports" element={<AdminReportIndex />} />
          <Route path="reports/booking" element={<AdminBookingReport />} />
          <Route path="reports/revenue" element={<AdminRevenueReport />} />
          <Route path="reports/schedule" element={<AdminScheduleReport />} />

          {/* Operators management */}
          <Route path="operators" element={<AdminOperatorList />} />
          <Route path="operators/create" element={<AdminOperatorCreate />} />
          <Route path="operators/:id/edit" element={<AdminOperatorEdit />} />
          <Route path="operators/:id" element={<AdminOperatorShow />} />

          {/* Users management */}
          <Route path="users" element={<AdminUsersList />} />
          <Route path="users/:id/edit" element={<AdminUsersEdit />} />
          <Route path="users/:id" element={<AdminUsersShow />} />

          {/* Vehicle Categories management */}
          <Route path="vehicleCategories" element={<VehicleCategoriesList />} />
          <Route path="vehicleCategories/create" element={<VehicleCategoriesCreate />} />
          <Route path="vehicleCategories/:id" element={<VehicleCategoriesShow />} />
          <Route path="vehicleCategories/:id/edit" element={<VehicleCategoriesEdit />} />
        </Route>

        {/* Operator routes - Fixed to use OperatorLayout */}
        <Route
          path="/operator"
          element={
            <ProtectedRoute allowedRoles={['operator']}>
              <OperatorLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/operator/dashboard" />} />
          <Route path="dashboard" element={<OperatorDashboard />} />

          {/* Bookings */}
          <Route path="bookings" element={<OperatorBookingList />} />
          <Route path="bookings/check-in" element={<OperatorBookingCheckIn />} />
          <Route path="bookings/:id" element={<OperatorBookingShow />} />

          {/* Schedules */}
          <Route path="schedules" element={<OperatorScheduleList />} />
          <Route path="schedules/:id" element={<OperatorScheduleShow />} />
          <Route path="schedules/:id/dates" element={<OperatorScheduleDates />} />
          <Route path="schedules/:id/dates/create" element={<OperatorScheduleCreateDate />} />
          <Route path="schedules/:id/dates/:dateId/edit" element={<OperatorScheduleEditDate />} />

          {/* Reports */}
          <Route path="reports" element={<OperatorReportIndex />} />
          <Route path="reports/daily" element={<OperatorDailyReport />} />
          <Route path="reports/monthly" element={<OperatorMonthlyReport />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;