import { useDeferredValue, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, History, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { formatCurrency, formatDate } from '../utils/format';
import { useApproverRequests } from '../hooks/useApiRequests';

export const ApproverDashboardPage = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const { data, isLoading } = useApproverRequests({ search: deferredSearch });
  const pending = data?.results ?? [];
  const history = useMemo(() => {
    if (!user) return [];
    const displayName = user.fullName || user.username;
    return pending.filter(req => req.approvals.some(apr => apr.approverName === displayName));
  }, [pending, user]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-gradient-to-r from-emerald-50 via-white to-slate-50 px-6 py-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">Approver workspace</p>
          <h1 className="text-2xl font-semibold text-slate-900">Pending Approvals</h1>
          <p className="text-sm text-slate-600">Review the oldest items first to keep procurement moving.</p>
        </div>
        <div className="rounded-2xl bg-white p-3 text-emerald-600 shadow-inner">
          <ShieldCheck className="h-7 w-7" />
        </div>
      </div>
      <div className="flex justify-end">
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search title, reference, vendor"
            className="w-64 bg-transparent outline-none placeholder:text-slate-400"
          />
        </div>
      </div>
      <div className="overflow-x-auto rounded-3xl border border-slate-100 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-emerald-500/80">
            <tr>
              <th className="px-5 py-3">Request</th>
              <th className="px-5 py-3">Staff</th>
              <th className="px-5 py-3">Vendor</th>
              <th className="px-5 py-3 text-right">Amount</th>
              <th className="px-5 py-3">Created</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-5 py-6">
                  <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
                </td>
              </tr>
            )}
            {!isLoading &&
              pending.map(req => (
                <tr key={req.id} className="bg-white hover:bg-slate-50">
                <td className="px-5 py-4 text-slate-900">
                  <p className="font-semibold">{req.title}</p>
                  <p className="text-xs text-slate-500">Level {req.currentApprovalLevel}</p>
                </td>
                <td className="px-5 py-4 text-slate-600">{req.createdBy.name}</td>
                <td className="px-5 py-4 text-slate-500">{req.vendorName || 'N/A'}</td>
                <td className="px-5 py-4 text-right font-medium text-slate-900">
                  {formatCurrency(req.amountEstimated, req.currency)}
                </td>
                <td className="px-5 py-4 text-slate-500">{formatDate(req.createdAt)}</td>
                <td className="px-5 py-4 text-right">
                  <Link to={`/requests/${req.id}`} className="text-sm font-semibold text-blue-600">
                    Review
                  </Link>
                </td>
              </tr>
              ))}
            {!isLoading && pending.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                  No requests awaiting your decision.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-700">
            <History className="h-4 w-4 text-slate-400" />
            My recent decisions
          </div>
          <div className="divide-y divide-slate-100">
            {history.map(entry => (
              <div key={entry.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="font-semibold text-slate-900">{entry.title}</p>
                <p className="text-xs text-slate-500">
                  {entry.approvals
                    .filter(apr => apr.approverName === (user?.fullName || user?.username))
                    .map(apr => `${apr.decision} on ${formatDate(apr.timestamp)}`)
                    .join(', ')}
                </p>
              </div>
              <StatusBadge status={entry.status} />
            </div>
          ))}
          {!history.length && (
            <p className="px-5 py-4 text-center text-sm text-slate-500">No approvals recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
