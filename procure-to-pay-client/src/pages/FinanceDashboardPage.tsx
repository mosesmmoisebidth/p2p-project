import { useDeferredValue, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ReceiptText, AlertTriangle, Search } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { formatCurrency } from '../utils/format';
import { StatCard } from '../components/StatCard';
import { useFinanceRequests } from '../hooks/useApiRequests';

type ValidationFilter = 'ALL' | 'MATCHED' | 'MISMATCHED' | 'UNPROCESSED';

export const FinanceDashboardPage = () => {
  const [validationFilter, setValidationFilter] = useState<ValidationFilter>('ALL');
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const validationParam =
    validationFilter === 'ALL'
      ? undefined
      : validationFilter === 'UNPROCESSED'
        ? 'pending'
        : validationFilter === 'MATCHED'
          ? 'matched'
          : 'mismatched';
  const { data, isLoading } = useFinanceRequests({ validation: validationParam, search: deferredSearch });
  const requests = data?.results ?? [];

  const stats = useMemo(() => {
    return {
      approved: requests.length,
      withReceipt: requests.filter(req => !!req.receiptUrl).length,
      mismatched: requests.filter(req => req.latestValidation && !req.latestValidation.is_match).length,
    };
  }, [requests]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-3xl border border-slate-100 bg-gradient-to-r from-slate-50 via-white to-emerald-50 px-6 py-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Finance workspace</p>
          <h1 className="text-2xl font-semibold text-slate-900">Approved Requests</h1>
          <p className="text-sm text-slate-600">Monitor receipt uploads and highlight mismatched validations.</p>
        </div>
        <div className="rounded-2xl bg-white p-3 text-slate-600 shadow-inner">
          <ReceiptText className="h-7 w-7" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Approved"
          value={String(stats.approved)}
          icon={<CheckCircle2 className="h-5 w-5" />}
          iconBgClassName="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="With receipt"
          value={String(stats.withReceipt)}
          icon={<ReceiptText className="h-5 w-5" />}
          iconBgClassName="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Exceptions"
          value={String(stats.mismatched)}
          subtitle="Receipt vs PO mismatches"
          pulse={stats.mismatched > 0}
          icon={<AlertTriangle className="h-5 w-5" />}
          iconBgClassName="bg-rose-50 text-rose-600"
        />
      </div>

      <div className="overflow-x-auto rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
          <p className="text-sm font-medium text-slate-600">Validation filter</p>
          <div className="flex flex-wrap items-center gap-2">
            {(['ALL', 'MATCHED', 'MISMATCHED', 'UNPROCESSED'] as ValidationFilter[]).map(filter => (
              <button
                key={filter}
                onClick={() => setValidationFilter(filter)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  validationFilter === filter
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {filter === 'ALL'
                  ? 'All'
                  : filter === 'MATCHED'
                    ? 'Matched'
                    : filter === 'MISMATCHED'
                      ? 'Mismatched'
                      : 'Awaiting validation'}
              </button>
            ))}
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search title, reference, vendor"
                className="w-56 bg-transparent outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Request</th>
                <th className="px-5 py-3">Vendor</th>
                <th className="px-5 py-3">PO Total</th>
                <th className="px-5 py-3">Receipt</th>
                <th className="px-5 py-3">Validation</th>
                <th className="px-5 py-3 text-right">Details</th>
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
              {!isLoading && requests.map(req => (
                <tr key={req.id} className="bg-white hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">{req.title}</p>
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="px-5 py-4 text-slate-600">{req.vendorName || 'N/A'}</td>
                  <td className="px-5 py-4 text-slate-800">
                    {req.purchaseOrder
                      ? formatCurrency(req.purchaseOrder.totalAmount, req.purchaseOrder.currency)
                      : 'N/A'}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {req.latestValidation?.details?.total_amount_match?.found
                      ? formatCurrency(
                          Number(req.latestValidation.details.total_amount_match.found),
                          req.purchaseOrder?.currency || req.currency || 'USD',
                        )
                      : req.receiptUrl
                        ? 'Processing'
                        : 'Awaiting'}
                  </td>
                  <td className="px-5 py-4">
                    {req.latestValidation ? (
                      <div>
                        <span
                          title={req.latestValidation.details?.llm_analysis?.summary || undefined}
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            req.latestValidation.is_match
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {req.latestValidation.is_match ? 'Matched' : 'Mismatched'}
                        </span>
                        {req.latestValidation.details?.llm_analysis?.summary && (
                          <p className="mt-1 text-xs text-slate-500">
                            {req.latestValidation.details.llm_analysis.summary}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400">Pending</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link to={`/requests/${req.id}`} className="text-sm font-semibold text-blue-600">
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
              {!isLoading && !requests.length && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                    No requests match the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
