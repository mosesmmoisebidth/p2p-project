import clsx from 'clsx';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';

interface Props extends HTMLMotionProps<'button'> {
  active?: boolean;
}

export const FilterChip = ({ active, className, children, ...props }: Props) => (
  <motion.button
    whileTap={{ scale: 0.95 }}
    className={clsx(
      'rounded-full border px-3 py-1 text-xs font-semibold transition-colors duration-200',
      active
        ? 'border-blue-500 bg-blue-600 text-white shadow-sm'
        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900',
      className,
    )}
    {...props}
  >
    {children}
  </motion.button>
);
