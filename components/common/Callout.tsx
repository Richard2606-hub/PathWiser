import { cn } from '@/lib/utils';

type Tone = 'default' | 'teal' | 'violet' | 'emerald' | 'amber' | 'rose';

const TONES: Record<Tone, { border: string; bg: string }> = {
  default:  { border: 'var(--border-strong)', bg: 'var(--bg-glass-strong)' },
  teal:     { border: 'var(--teal)', bg: 'var(--teal-glow)' },
  violet:   { border: 'var(--violet)', bg: 'var(--violet-glow)' },
  emerald:  { border: 'var(--emerald)', bg: 'rgba(16, 185, 129, 0.10)' },
  amber:    { border: 'var(--amber)', bg: 'rgba(245, 158, 11, 0.12)' },
  rose:     { border: 'var(--rose)', bg: 'rgba(244, 63, 94, 0.12)' },
};

export function Callout({
  tone = 'default',
  children,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  const t = TONES[tone];
  return (
    <div
      className={cn(
        'p-4 rounded-xl border border-[color:var(--border)] border-l-[4px] text-sm text-[color:var(--text-2)] leading-relaxed',
        className
      )}
      style={{ borderLeftColor: t.border, background: t.bg }}
    >
      {children}
    </div>
  );
}
