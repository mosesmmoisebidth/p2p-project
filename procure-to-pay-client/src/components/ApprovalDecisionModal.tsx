import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Button } from './ui/Button';

interface ApprovalDecisionModalProps {
  open: boolean;
  mode: 'approve' | 'reject';
  onClose: () => void;
  onConfirm: (comment: string) => void;
  loading?: boolean;
}

const titles = {
  approve: 'Approve request',
  reject: 'Reject request',
};

const descriptions = {
  approve: 'Confirm that the purchase request meets your review criteria.',
  reject: 'Share why this request should be rejected so the requester can adjust.',
};

export const ApprovalDecisionModal = ({
  open,
  mode,
  onClose,
  onConfirm,
  loading,
}: ApprovalDecisionModalProps) => {
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!open) {
      setComment('');
    }
  }, [open, mode]);

  if (!open) return null;

  const Icon = mode === 'approve' ? CheckCircle2 : XCircle;

  const handleSubmit = (evt: FormEvent) => {
    evt.preventDefault();
    onConfirm(comment.trim());
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <div
            className={`rounded-2xl p-3 ${
              mode === 'approve' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}
          >
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{titles[mode]}</h3>
            <p className="text-sm text-slate-500">{descriptions[mode]}</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <label className="text-sm font-medium text-slate-600">
            Comment (optional)
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              rows={3}
              placeholder="Add context for the requester..."
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant={mode === 'approve' ? 'primary' : 'danger'}
              loading={loading}
            >
              {mode === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};
