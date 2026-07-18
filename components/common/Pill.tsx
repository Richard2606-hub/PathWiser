import { cn } from '@/lib/utils';

type Variant = 'default' | 'acquired' | 'bridge' | 'gap';

const VARIANTS: Record<Variant, string> = {
  default:  'bg-[color:var(--bg-elevated)] border border-[color:var(--border)] text-[color:var(--text-2)]',
  acquired: 'bg-[color:rgba(45,212,191,0.08)] border border-[color:var(--teal)] text-[color:var(--teal)]',
  bridge:   'bg-[color:rgba(250,204,21,0.08)] border border-[color:var(--yellow)] text-[color:var(--yellow)]',
  gap:      'bg-[color:rgba(251,113,133,0.08)] border border-[color:var(--rose)] text-[color:var(--rose)]',
};

export function Pill({
  variant = 'default',
  children,
  className,
}: {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium rounded-md whitespace-nowrap',
        VARIANTS[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
