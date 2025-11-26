import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

interface Props {
  children?: ReactNode;
}

export const ProtectedRoute = ({ children }: Props) => {
  const { user, initializing } = useAuth();
  const location = useLocation();
  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children ? <>{children}</> : <Outlet />;
};

interface RoleGuardProps {
  allowed: string[];
  children: ReactNode;
}

export const RoleGuard = ({ allowed, children }: RoleGuardProps) => {
  const { user, initializing } = useAuth();
  if (initializing) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'super_admin') return <>{children}</>;
  if (!allowed.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};
