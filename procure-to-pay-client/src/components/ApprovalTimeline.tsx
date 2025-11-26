import type { ApprovalDecision } from '../types';
import { formatDate } from '../utils/format';
import { StatusBadge } from './StatusBadge';

interface Props {
  approvals: ApprovalDecision[];
  currentLevel: number;
}

export const ApprovalTimeline = ({ approvals, currentLevel }: Props) => {
  const levels: Array<1 | 2> = [1, 2];
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h4 className="mb-4 text-base font-semibold text-slate-800">Approval Timeline</h4>
      <ol className="space-y-4">
        {levels.map(level => {
          const decision = approvals.find(apr => apr.level === level);
          return (
            <li key={level} className="flex gap-3">
              <div
                className={`mt-1 h-3 w-3 rounded-full ${
                  decision
                    ? decision.decision === 'approved'
                      ? 'bg-emerald-500'
                      : 'bg-rose-500'
                    : level === currentLevel
                      ? 'bg-amber-400'
                      : 'bg-slate-300'
                }`}
              />
              <div className="flex-1 rounded-lg border border-slate-100 bg-slate-50 px-4 py-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-slate-700">Level {level}</p>
                  {decision ? (
                    <StatusBadge status={decision.decision === 'approved' ? 'APPROVED' : 'REJECTED'} />
                  ) : (
                    <span className="text-xs font-semibold text-amber-600">Waiting</span>
                  )}
                </div>
                <p className="text-sm text-slate-500">
                  {decision
                    ? `${decision.approverName} - ${formatDate(decision.timestamp)}`
                    : 'Pending assignment'}
                </p>
                {decision?.comment && <p className="mt-2 text-sm text-slate-600">{decision.comment}</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};
