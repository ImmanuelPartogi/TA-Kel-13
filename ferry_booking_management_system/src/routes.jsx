import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Layouts
import AdminLayout from './components/layout/AdminLayout';
import OperatorLayout from './components/layout/OperatorLayout';
import PublicLayout from './components/layout/PublicLayout';

// Public Pages
import Home from './pages/public/Home';
import Search from './pages/public/Search';
import BookingForm from './pages/public/BookingForm';

// Auth Pages
import AdminLogin from './pages/admin/auth/Login';
import OperatorLogin from './pages/operator/auth/Login';

// Admin Pages
import AdminDashboard from './pages/admin/dashboard';
import AdminList from './pages/admin/admins';
import OperatorList from './pages/admin/operators';
import RouteList from './pages/admin/routes';
import FerryList from './pages/admin/ferries';
import ScheduleList from './pages/admin/schedules';
import ScheduleDates from './pages/admin/schedules/Dates';
import BookingList from './pages/admin/bookings';
import UserList from './pages/admin/users';
import Reports from './pages/admin/reports';
import Refunds from './pages/admin/refunds';

// Operator Pages
import OperatorDashboard from './pages/operator/dashboard';
import OperatorSchedules from './pages/operator/schedules';
import OperatorBookings from './pages/operator/bookings';
import CheckIn from './pages/operator/checkin';
import OperatorReports from './pages/operator/reports';

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/search" element={<PublicLayout><Search /></PublicLayout>} />
            <Route path="/booking/:routeId" element={<PublicLayout><BookingForm /></PublicLayout>} />

            {/* Auth Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/operator/login" element={<OperatorLogin />} />

            {/* Admin Routes */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute requiredRole="admin">
                        <AdminLayout><AdminDashboard /></AdminLayout>
                    </ProtectedRoute>
                }
            />      <Route path="/admin/dashboard" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
            <Route path="/admin/admins" element={<AdminLayout><AdminList /></AdminLayout>} />
            <Route path="/admin/operators" element={<AdminLayout><OperatorList /></AdminLayout>} />
            <Route path="/admin/routes" element={<AdminLayout><RouteList /></AdminLayout>} />
            <Route path="/admin/ferries" element={<AdminLayout><FerryList /></AdminLayout>} />
            <Route path="/admin/schedules" element={<AdminLayout><ScheduleList /></AdminLayout>} />
            <Route path="/admin/schedules/:id/dates" element={<AdminLayout><ScheduleDates /></AdminLayout>} />
            <Route path="/admin/bookings" element={<AdminLayout><BookingList /></AdminLayout>} />
            <Route path="/admin/users" element={<AdminLayout><UserList /></AdminLayout>} />
            <Route path="/admin/reports" element={<AdminLayout><Reports /></AdminLayout>} />
            <Route path="/admin/refunds" element={<AdminLayout><Refunds /></AdminLayout>} />

            {/* Operator Routes */}
            <Route
                path="/operator"
                element={
                    <ProtectedRoute requiredRole="operator">
                        <OperatorLayout><OperatorDashboard /></OperatorLayout>
                    </ProtectedRoute>
                }
            />            <Route path="/operator/dashboard" element={<OperatorLayout><OperatorDashboard /></OperatorLayout>} />
            <Route path="/operator/schedules" element={<OperatorLayout><OperatorSchedules /></OperatorLayout>} />
            <Route path="/operator/bookings" element={<OperatorLayout><OperatorBookings /></OperatorLayout>} />
            <Route path="/operator/check-in" element={<OperatorLayout><CheckIn /></OperatorLayout>} />
            <Route path="/operator/reports" element={<OperatorLayout><OperatorReports /></OperatorLayout>} />

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;