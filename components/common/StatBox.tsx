import { cn } from '@/lib/utils';

interface StatBoxProps {
  label: string;
  value: string | number;
  color?: string;
  className?: string;
}

export function StatBox({ label, value, color, className }: StatBoxProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden p-4 sm:p-5 rounded-xl border border-[color:var(--border)] bg-white shadow-[0_4px_18px_rgba(15,23,42,0.04)]',
        'flex flex-col gap-1.5 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(15,23,42,0.08)] transition-all',
        className
      )}
    >
      <span className="text-[11px] font-semibold text-[color:var(--text-2)]">
        {label}
      </span>
      <span
        className="text-2xl font-extrabold tracking-tight tabular-nums text-[color:var(--text-1)]"
        style={color ? { color } : undefined}
      >
        {value}
      </span>
    </div>
  );
}

export function StatGrid({ children, cols = 4 }: { children: React.ReactNode; cols?: 2 | 3 | 4 }) {
  const gridClass =
    cols === 4 ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-4'
    : cols === 3 ? 'grid-cols-2 sm:grid-cols-3'
    : 'grid-cols-1 sm:grid-cols-2';
  return (
    <div className={cn('grid gap-3', gridClass)}>
      {children}
    </div>
  );
}
