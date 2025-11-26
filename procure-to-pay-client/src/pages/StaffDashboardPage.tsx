import { useDeferredValue, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  CheckCircle2,
  Receipt,
  Shield,
  RefreshCcw,
  ClipboardList,
  Clock3,
  BadgeCheck,
  Search,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStaffRequests } from '../hooks/useApiRequests';
import { StatusBadge } from '../components/StatusBadge';
import { formatCurrency } from '../utils/format';
import { StatCard } from '../components/StatCard';
import { EmptyState } from '../components/EmptyState';
import { FilterChip } from '../components/ui/FilterChip';
import { Button } from '../components/ui/Button';

const statusFilters = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const;

const ageInDays = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
};

const indicators = [
  { key: 'proformaUrl', icon: FileText, label: 'Proforma uploaded' },
  { key: 'purchaseOrder', icon: CheckCircle2, label: 'Purchase order generated' },
  { key: 'receiptUrl', icon: Receipt, label: 'Receipt uploaded' },
  { key: 'validation', icon: Shield, label: 'Validation available' },
] as const;

export const StaffDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<(typeof statusFilters)[number]>('ALL');
  const [search, setSearch] = useState('');
  const statusParam = status === 'ALL' ? undefined : status;
  const deferredSearch = useDeferredValue(search);
  const { data, isLoading } = useStaffRequests({ status: statusParam, search: deferredSearch });
  const requests = data?.results ?? [];

  const myRequests = useMemo(() => requests.filter(req => req.createdBy.id === user?.id), [requests, user?.id]);

  const stats = useMemo(() => {
    return {
      total: myRequests.length,
      pending: myRequests.filter(req => req.status === 'PENDING').length,
      approved: myRequests.filter(req => req.status === 'APPROVED').length,
    };
  }, [myRequests]);

  const applyFilter = (filter: (typeof statusFilters)[number]) => setStatus(filter);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-gradient-to-r from-blue-50 via-white to-slate-50 px-6 py-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-500">Staff workspace</p>
          <h1 className="text-2xl font-semibold text-slate-900">My Purchase Requests</h1>
          <p className="text-sm text-slate-600">Track every request from proforma to payment.</p>
        </div>
        <Link to="/requests/new">
          <Button size="md">
            Create New Request
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total requests"
          value={String(stats.total)}
          onClick={() => applyFilter('ALL')}
          icon={<ClipboardList className="h-5 w-5" />}
          iconBgClassName="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          title="Pending approval"
          value={String(stats.pending)}
          onClick={() => applyFilter('PENDING')}
          icon={<Clock3 className="h-5 w-5" />}
          iconBgClassName="bg-amber-50 text-amber-500"
        />
        <StatCard
          title="Approved"
          value={String(stats.approved)}
          subtitle="With generated PO"
          onClick={() => applyFilter('APPROVED')}
          icon={<BadgeCheck className="h-5 w-5" />}
          iconBgClassName="bg-emerald-50 text-emerald-600"
        />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white/90 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-700">Filter by status</p>
            <p className="text-xs text-slate-500">Choose a badge to refine your list</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {statusFilters.map(filter => (
              <FilterChip key={filter} active={status === filter} onClick={() => setStatus(filter)}>
                {filter === 'ALL' ? 'All' : filter.charAt(0) + filter.slice(1).toLowerCase()}
              </FilterChip>
            ))}
            <button
              onClick={() => setStatus('ALL')}
              className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              <RefreshCcw className="h-3 w-3" /> Reset
            </button>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search title, reference, vendor"
                className="w-48 bg-transparent outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
        {isLoading ? (
          <div className="space-y-3 p-6">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="animate-pulse rounded-2xl bg-slate-100 px-5 py-4" />
            ))}
          </div>
        ) : myRequests.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No requests yet"
              description="Create your first purchase request to get started."
              actionLabel="Create Request"
              onAction={() => (window.location.href = '/requests/new')}
            />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-slate-100 shadow-sm">
            <table className="min-w-full divide-y divide-slate-100 text-sm bg-white">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 text-blue-400">Request</th>
                  <th className="px-5 py-3 text-blue-400">Vendor</th>
                  <th className="px-5 py-3 text-blue-400">Indicators</th>
                  <th className="px-5 py-3 text-blue-400">Status</th>
                  <th className="px-5 py-3 text-right text-blue-400">Amount</th>
                  <th className="px-5 py-3 text-blue-400">Age</th>
                  <th className="px-5 py-3 text-right text-blue-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myRequests.map(request => (
                  <tr key={request.id} className="bg-white transition hover:bg-slate-50 hover:shadow-sm">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{request.title}</p>
                      <p className="text-xs text-slate-500">{request.id}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{request.vendorName || 'N/A'}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        {indicators.map(ind => {
                          const exists = request[ind.key as keyof typeof request];
                          if (!exists) return null;
                          const Icon = ind.icon;
                          return (
                            <span
                              key={ind.key}
                              title={ind.label}
                              className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-500"
                            >
                              <Icon className="h-3.5 w-3.5" /> {ind.label.split(' ')[0]}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={request.status} />
                    </td>
                    <td className="px-5 py-4 text-right font-medium text-slate-900">
                      {formatCurrency(request.amountEstimated, request.currency)}
                    </td>
                    <td className="px-5 py-4 text-slate-500">{ageInDays(request.createdAt)} days</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {request.status === 'PENDING' && request.approvals.length === 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/requests/${request.id}/edit`)}
                          >
                            Edit
                          </Button>
                        )}
                        {request.status === 'APPROVED' && !request.receiptUrl && (
                          <Link
                            to={`/requests/${request.id}`}
                            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-400"
                          >
                            Upload receipt
                          </Link>
                        )}
                        <Link
                          to={`/requests/${request.id}`}
                          className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};
