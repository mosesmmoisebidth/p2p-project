import type { RequestStatus } from '../types';

interface Props {
  status: RequestStatus;
}

const palette: Record<RequestStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800 border border-amber-200',
  APPROVED: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  REJECTED: 'bg-rose-100 text-rose-800 border border-rose-200',
};

export const StatusBadge = ({ status }: Props) => (
  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${palette[status]}`}>
    {status === 'PENDING' ? 'Pending Approval' : status === 'APPROVED' ? 'Approved' : 'Rejected'}
  </span>
);
