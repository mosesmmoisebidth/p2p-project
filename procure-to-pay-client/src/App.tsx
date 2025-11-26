import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { StaffDashboardPage } from './pages/StaffDashboardPage';
import { RequestFormPage } from './pages/RequestFormPage';
import { RequestDetailPage } from './pages/RequestDetailPage';
import { ApproverDashboardPage } from './pages/ApproverDashboardPage';
import { FinanceDashboardPage } from './pages/FinanceDashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProtectedRoute, RoleGuard } from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

const defaultRouteByRole = {
  staff: '/staff/dashboard',
  approver_lvl1: '/approver/dashboard',
  approver_lvl2: '/approver/dashboard',
  finance: '/finance/dashboard',
  super_admin: '/staff/dashboard',
} as const;

function App() {
  const { user } = useAuth();
  const home = user ? defaultRouteByRole[user.role] : '/login';

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/" element={<Navigate to={home} replace />} />
        <Route
          path="/staff/dashboard"
          element={
            <RoleGuard allowed={['staff', 'super_admin']}>
              <StaffDashboardPage />
            </RoleGuard>
          }
        />
        <Route path="/profile" element={<ProfilePage />} />
        <Route
          path="/requests/new"
          element={
            <RoleGuard allowed={['staff', 'super_admin']}>
              <RequestFormPage />
            </RoleGuard>
          }
        />
        <Route
          path="/requests/:id/edit"
          element={
            <RoleGuard allowed={['staff', 'super_admin']}>
              <RequestFormPage />
            </RoleGuard>
          }
        />
        <Route path="/requests/:id" element={<RequestDetailPage />} />
        <Route
          path="/approver/dashboard"
          element={
            <RoleGuard allowed={['approver_lvl1', 'approver_lvl2', 'super_admin']}>
              <ApproverDashboardPage />
            </RoleGuard>
          }
        />
        <Route
          path="/finance/dashboard"
          element={
            <RoleGuard allowed={['finance', 'super_admin']}>
              <FinanceDashboardPage />
            </RoleGuard>
          }
        />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
