import { forwardRef } from 'react';
import clsx from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary:
    'bg-blue-600 text-white hover:bg-blue-500 focus-visible:ring-blue-200 active:bg-blue-700',
  secondary:
    'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:text-slate-900 focus-visible:ring-slate-200 active:bg-slate-50',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-200 active:bg-slate-200',
  danger:
    'bg-rose-600 text-white hover:bg-rose-500 focus-visible:ring-rose-200 active:bg-rose-700',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-3 text-sm',
};

const spinnerColor: Record<Variant, string> = {
  primary: 'border-white/60 border-t-white',
  secondary: 'border-slate-400 border-t-slate-600',
  ghost: 'border-slate-400 border-t-slate-600',
  danger: 'border-white/60 border-t-white',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth, className, loading = false, children, disabled, ...props }, ref) => {
    const spinner = (
      <span
        className={clsx(
          'h-4 w-4 animate-spin rounded-full border-2',
          spinnerColor[variant],
        )}
        aria-hidden="true"
      />
    );

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          'inline-flex items-center justify-center gap-2 rounded-full font-semibold shadow-sm transition duration-200 ease-out focus-visible:outline-none focus-visible:ring cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 active:scale-95',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {loading && spinner}
        <span>{children}</span>
      </button>
    );
  },
);

Button.displayName = 'Button';
