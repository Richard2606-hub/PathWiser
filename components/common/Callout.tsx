import { cn } from '@/lib/utils';

type Tone = 'default' | 'teal' | 'violet' | 'emerald' | 'amber' | 'rose';

const TONES: Record<Tone, { border: string; bg: string }> = {
  default:  { border: 'var(--border-strong)', bg: '#f8fafc' },
  teal:     { border: 'var(--teal)', bg: 'rgba(15,159,143,0.07)' },
  violet:   { border: 'var(--violet)', bg: 'rgba(124,58,237,0.07)' },
  emerald:  { border: 'var(--emerald)', bg: 'rgba(5,150,105,0.07)' },
  amber:    { border: 'var(--amber)', bg: 'rgba(217,119,6,0.07)' },
  rose:     { border: 'var(--rose)', bg: 'rgba(225,29,72,0.07)' },
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
