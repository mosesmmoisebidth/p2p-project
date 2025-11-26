import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { ReactNode } from 'react';

interface Props {
  title: string;
  value: string;
  subtitle?: string;
  onClick?: () => void;
  pulse?: boolean;
  icon?: ReactNode;
  iconBgClassName?: string;
}

export const StatCard = ({
  title,
  value,
  subtitle,
  onClick,
  pulse,
  icon,
  iconBgClassName,
}: Props) => (
  <motion.button
    type="button"
    whileHover={{ scale: onClick ? 1.02 : 1 }}
    whileTap={{ scale: onClick ? 0.98 : 1 }}
    onClick={onClick}
    className={clsx(
      'w-full rounded-3xl border border-slate-200 bg-white/95 p-4 text-left shadow-sm transition focus-visible:outline-none focus-visible:ring focus-visible:ring-blue-200',
      onClick ? 'cursor-pointer hover:border-blue-200 hover:bg-white' : 'cursor-default',
    )}
  >
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
        <div className="mt-2 flex items-center gap-2">
          <p className="text-2xl font-semibold text-slate-900">{value}</p>
          {pulse && (
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
            </span>
          )}
        </div>
      </div>
      {icon && (
        <div
          className={clsx(
            'rounded-2xl p-2 text-lg text-blue-600 shadow-inner',
            iconBgClassName ?? 'bg-blue-50',
          )}
        >
          {icon}
        </div>
      )}
    </div>
    {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
  </motion.button>
);
