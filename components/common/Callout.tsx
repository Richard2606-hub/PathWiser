import { cn } from '@/lib/utils';

type Tone = 'default' | 'teal' | 'violet' | 'emerald' | 'amber' | 'rose';

const TONES: Record<Tone, { border: string; bg: string }> = {
  default:  { border: 'var(--border-strong)', bg: 'var(--bg-glass)' },
  teal:     { border: 'var(--teal)', bg: 'rgba(45,212,191,0.06)' },
  violet:   { border: 'var(--violet)', bg: 'rgba(167,139,250,0.06)' },
  emerald:  { border: 'var(--emerald)', bg: 'rgba(52,211,153,0.06)' },
  amber:    { border: 'var(--amber)', bg: 'rgba(251,191,36,0.06)' },
  rose:     { border: 'var(--rose)', bg: 'rgba(251,113,133,0.06)' },
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
        'p-3.5 rounded-md border-l-[3px] text-sm text-[color:var(--text-2)] leading-relaxed',
        className
      )}
      style={{ borderLeftColor: t.border, background: t.bg }}
    >
      {children}
    </div>
  );
}
