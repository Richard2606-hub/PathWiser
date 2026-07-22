'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'teal' | 'violet' | 'amber' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const VARIANTS: Record<Variant, string> = {
  primary:  'bg-[color:var(--yellow)] text-white shadow-[0_8px_22px_rgba(79,70,229,0.22)] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(79,70,229,0.28)]',
  teal:     'bg-[color:var(--teal)] text-white shadow-sm hover:-translate-y-0.5 hover:brightness-105',
  violet:   'bg-[color:var(--violet)] text-white shadow-sm hover:-translate-y-0.5 hover:brightness-105',
  amber:    'bg-[color:var(--amber)] text-white shadow-sm hover:-translate-y-0.5 hover:brightness-105',
  ghost:    'bg-transparent text-[color:var(--text-2)] hover:text-[color:var(--text-1)] hover:bg-[color:var(--bg-glass)]',
  outline:  'bg-white border border-[color:var(--border)] text-[color:var(--text-1)] shadow-sm hover:border-[color:var(--accent)] hover:bg-[color:var(--bg-elevated)]',
};

const SIZES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3.5 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'font-semibold rounded-[10px] transition-all duration-150 ease-out',
        'focus-visible:outline-2 focus-visible:outline-[color:var(--accent)] focus-visible:outline-offset-2',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        'active:scale-[0.98]',
        'inline-flex items-center justify-center gap-1.5',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = 'Button';
