import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatRole } from '../utils/format';
import { useToast } from '../hooks/useToast';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

const navByRole = {
  staff: [
    { label: 'Dashboard', to: '/staff/dashboard' },
    { label: 'New Request', to: '/requests/new' },
  ],
  approver_lvl1: [
    { label: 'Approvals', to: '/approver/dashboard' },
  ],
  approver_lvl2: [
    { label: 'Approvals', to: '/approver/dashboard' },
  ],
  finance: [
    { label: 'Finance', to: '/finance/dashboard' },
  ],
  super_admin: [
    { label: 'Staff', to: '/staff/dashboard' },
    { label: 'Approvals', to: '/approver/dashboard' },
    { label: 'Finance', to: '/finance/dashboard' },
  ],
} as const;

const getNavItems = (role?: string) => {
  if (!role) return [];
  return navByRole[role as keyof typeof navByRole] ?? [];
};

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const items = useMemo(() => getNavItems(user?.role), [user?.role]);
  const initials = useMemo(() => {
    if (!user) return '';
    const source = user.fullName || user.username;
    return source
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('');
  }, [user]);

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await logout();
      toast.info('You have been logged out.');
      navigate('/login', { replace: true });
    } finally {
      setLogoutLoading(false);
      setConfirmingLogout(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white px-6 py-8 lg:flex">
        <div className="flex items-center gap-3">
          <img src="/procure-to-pay.png" alt="Smart P2P" className="h-10 w-10 rounded-lg" />
          <div>
            <p className="text-lg font-semibold text-slate-900">Smart P2P</p>
            <p className="text-xs text-slate-500">Procure-to-Pay Platform</p>
          </div>
        </div>
        <nav className="mt-10 space-y-2">
          {items.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `block rounded-xl px-4 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm lg:px-8">
          <div className="flex items-center gap-3 lg:hidden">
            <img src="/procure-to-pay.png" alt="Smart P2P" className="h-8 w-8 rounded-lg" />
            <p className="text-base font-semibold text-slate-900">Smart P2P</p>
          </div>
          <div className="hidden text-sm font-semibold text-slate-700 lg:block">
            {items[0]?.label || 'Dashboard'}
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-3 rounded-full border border-slate-200 px-3 py-1.5 text-left text-slate-700 transition hover:border-slate-300"
                >
                  <div className="flex flex-col text-xs leading-tight">
                    <span className="text-sm font-semibold text-slate-900">
                      {user.fullName || user.username}
                    </span>
                    <span className="text-[11px] uppercase tracking-wide text-slate-400">
                      {formatRole(user.role)}
                    </span>
                  </div>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                    {initials || 'U'}
                  </span>
                </Link>
                <button
                  onClick={() => setConfirmingLogout(true)}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-10">
          <Outlet />
        </main>
      </div>
      <ConfirmDialog
        open={confirmingLogout}
        title="Sign out?"
        description="You will be redirected to the login screen and your session token will be cleared."
        confirmLabel="Logout"
        onConfirm={handleLogout}
        onCancel={() => !logoutLoading && setConfirmingLogout(false)}
        loading={logoutLoading}
        icon={<LogOut className="h-5 w-5 text-rose-600" />}
      />
    </div>
  );
};
