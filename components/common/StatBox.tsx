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
        'p-3.5 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)]',
        'flex flex-col gap-1 hover:border-[color:var(--border-strong)] hover:bg-[color:var(--bg-glass-strong)] transition-all',
        className
      )}
    >
      <span className="font-mono text-[9px] uppercase tracking-wider text-[color:var(--text-3)]">
        {label}
      </span>
      <span
        className="text-2xl font-extrabold tracking-tight tabular-nums"
        style={color ? { color } : { color: 'var(--yellow)' }}
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
    <div className={cn('grid gap-2', gridClass)}>
      {children}
    </div>
  );
}
