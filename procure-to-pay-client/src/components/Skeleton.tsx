import clsx from 'clsx';

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => (
  <div className={clsx('animate-pulse rounded-lg bg-slate-200/70', className)} />
);
