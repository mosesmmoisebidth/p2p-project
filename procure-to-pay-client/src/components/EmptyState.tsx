import type { ReactNode } from 'react';
import { Button } from './ui/Button';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
}

export const EmptyState = ({ title, description, actionLabel, onAction, icon }: EmptyStateProps) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-slate-200 bg-white/80 px-8 py-12 text-center shadow-sm"
  >
    <div className="text-4xl">{icon ?? '📄'}</div>
    <div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
    {actionLabel && (
      <Button onClick={onAction} size="sm">
        {actionLabel}
      </Button>
    )}
  </motion.div>
);
