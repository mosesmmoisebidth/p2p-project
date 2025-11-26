import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  icon?: ReactNode;
}

export const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading,
  icon,
}: ConfirmDialogProps) => {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start gap-3">
          {icon && <div className="mt-1 text-slate-600">{icon}</div>}
          <div>
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Please wait...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
