import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Public pages
import Welcome from './pages/Welcome';
import Login from './pages/auth/Login';

// Admin layouts
import AdminLayout from './layouts/AdminLayout';

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
// import AdminScheduleList from './pages/admin/schedules/ScheduleList';
import AdminScheduleCreate from './pages/admin/schedules/ScheduleCreate';
import AdminScheduleEdit from './pages/admin/schedules/ScheduleEdit';
import AdminScheduleShow from './pages/admin/schedules/ScheduleShow';
import AdminScheduleDates from './pages/admin/schedules/ScheduleDates';

// Admin pages - Bookings
// import AdminBookingList from './pages/admin/bookings/BookingList';
import AdminBookingCreate from './pages/admin/bookings/BookingCreate';
import AdminBookingReschedule from './pages/admin/bookings/BookingReschedule';
import AdminBookingShow from './pages/admin/bookings/BookingShow';

// Admin pages - Refunds
// import AdminRefundList from './pages/admin/refunds/RefundList';
import AdminRefundCreate from './pages/admin/refunds/RefundCreate';
import AdminRefundShow from './pages/admin/refunds/RefundShow';

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

// Admin pages - Other
// import AdminDashboard from './pages/admin/schedules/Dashboard';

// Operator pages
import OperatorLogin from './pages/operator/auth/Login';
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
// import OperatorScheduleList from './pages/operator/schedules/ScheduleList';
import OperatorScheduleCreateDate from './pages/operator/schedules/ScheduleCreateDate';
// import OperatorScheduleDates from './pages/operator/schedules/ScheduleDates';
import OperatorScheduleEditDate from './pages/operator/schedules/ScheduleEditDate';
import OperatorScheduleShow from './pages/operator/schedules/ScheduleShow';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
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
          <Route path="bookings/create" element={<AdminBookingCreate />} />
          <Route path="bookings/:id/reschedule" element={<AdminBookingReschedule />} />
          <Route path="bookings/:id" element={<AdminBookingShow />} />
          
          {/* Refunds management */}
          <Route path="refunds" element={<AdminRefundList />} />
          <Route path="refunds/create/:bookingId" element={<AdminRefundCreate />} />
          <Route path="refunds/:id" element={<AdminRefundShow />} />
          
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
        </Route>

        {/* Operator routes */}
        <Route path="/operator/login" element={<OperatorLogin />} />
        
        <Route
          path="/operator"
          element={
            <ProtectedRoute allowedRoles={['operator']}>
              <AdminLayout />
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