import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Building2, CalendarDays } from 'lucide-react';
import { isAxiosError } from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { formatRole } from '../utils/format';
import type { Role } from '../types';

const roleHelpCopy: Record<Role, string> = {
  staff: 'Create purchase requests, attach vendor proformas, and track approvals here.',
  approver_lvl1: 'Review early-stage requests, collaborate with staff, and escalate when ready.',
  approver_lvl2: 'Finalize approvals, unlock purchase order generation, and leave audit-ready notes.',
  finance: 'Monitor approved requests, upload receipts, and review validation insights before payment.',
  super_admin: 'Manage every workflow lane, including staff, approver, and finance dashboards.',
};

export const ProfilePage = () => {
  const { user, refreshProfile, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoutLoading, setLogoutLoading] = useState(false);

  if (!user) {
    return null;
  }

  const memberSince = user.dateJoined ? new Date(user.dateJoined).toLocaleDateString() : 'N/A';

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      await refreshProfile();
      toast.success('Profile synced.');
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 401) {
        setError('Session expired. Redirecting to login.');
        await logout();
        navigate('/login', { replace: true });
      } else {
        setError('Unable to refresh profile right now.');
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await logout();
      toast.info('You have been logged out.');
      navigate('/login', { replace: true });
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-400">Account</p>
          <h1 className="text-2xl font-semibold text-slate-900">Profile & Preferences</h1>
          <p className="text-sm text-slate-500">Keep your workspace details synchronized.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? 'Refreshing...' : 'Refresh Profile'}
          </Button>
          <Button variant="danger" onClick={handleLogout} disabled={logoutLoading}>
            {logoutLoading ? 'Logging out...' : 'Logout'}
          </Button>
        </div>
      </div>
      {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      <Card className="p-6">
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Full name</p>
              <p className="text-lg font-semibold text-slate-900">{user.fullName}</p>
            </div>
            <div className="flex flex-col gap-6 sm:flex-row">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
                <Mail className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Email</p>
                  <p className="text-sm font-medium text-slate-800">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
                <Building2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Department</p>
                  <p className="text-sm font-medium text-slate-800">{user.department || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full max-w-xs space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-slate-600" />
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Role</p>
                <p className="text-sm font-semibold text-slate-900">{formatRole(user.role)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-slate-600" />
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Member since</p>
                <p className="text-sm font-semibold text-slate-900">{memberSince}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900">Role guidance</h3>
        <p className="mt-2 text-sm text-slate-600">
          {roleHelpCopy[user.role] || 'Use Smart P2P to collaborate with your finance team.'}
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-xs uppercase tracking-wide text-blue-600">Need assistance?</p>
            <p className="mt-1 text-sm text-blue-900">
              Reach out to your Smart P2P administrator for user management or role updates.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p className="text-xs uppercase tracking-wide text-slate-500">Security tip</p>
            <p className="mt-1">
              Always log out after reviewing financial data on shared machines.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
