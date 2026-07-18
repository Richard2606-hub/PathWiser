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
  primary:  'bg-[color:var(--yellow)] text-[color:var(--bg-base)] hover:brightness-110',
  teal:     'bg-[color:var(--teal)] text-[color:var(--bg-base)] hover:brightness-110',
  violet:   'bg-[color:var(--violet)] text-[color:var(--bg-base)] hover:brightness-110',
  amber:    'bg-[color:var(--amber)] text-[color:var(--bg-base)] hover:brightness-110',
  ghost:    'bg-transparent text-[color:var(--text-2)] hover:text-[color:var(--text-1)] hover:bg-[color:var(--bg-glass)]',
  outline:  'bg-transparent border border-[color:var(--border-strong)] text-[color:var(--text-1)] hover:border-[color:var(--accent)]',
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
        'font-semibold rounded-md transition-all duration-150 ease-out',
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
