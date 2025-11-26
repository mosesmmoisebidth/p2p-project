import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card = ({ children, className, hover = true }: CardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2 }}
    whileHover={hover ? { scale: 1.01, boxShadow: '0 12px 30px rgba(15,23,42,0.08)' } : undefined}
    className={clsx('rounded-2xl border border-slate-200 bg-white shadow-sm', className)}
  >
    {children}
  </motion.div>
);
