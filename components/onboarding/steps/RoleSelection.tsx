'use client';

import { cn } from '@/lib/utils';
import type { Persona } from '@/types';

const CHOICES: Array<{
  key: Persona;
  emoji: string;
  title: string;
  tagline: string;
  color: string;
  bg: string;
}> = [
  { key: 'candidate',  emoji: '👤', title: 'Candidate',  tagline: 'I want to navigate my career', color: 'var(--yellow)', bg: 'rgba(250,204,21,0.06)' },
  { key: 'employer',   emoji: '🏢', title: 'Employer',   tagline: 'I need to find + keep talent',  color: 'var(--teal)',   bg: 'rgba(45,212,191,0.06)' },
  { key: 'university', emoji: '🎓', title: 'University', tagline: 'I want to close the curriculum loop', color: 'var(--violet)', bg: 'rgba(167,139,250,0.06)' },
];

export function RoleSelection({
  selected,
  onSelect,
}: {
  selected: Persona | null;
  onSelect: (p: Persona) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-[color:var(--text-2)]">
        In production, each user has their own account — so pick the role that fits you today.
        You can switch later using the Judge view toggle.
      </p>
      <div className="grid gap-2.5 sm:grid-cols-3">
        {CHOICES.map((c) => {
          const active = selected === c.key;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => onSelect(c.key)}
              className={cn(
                'flex flex-col items-start gap-1.5 p-4 rounded-lg border-2 transition-all text-left',
                'hover:-translate-y-0.5 hover:shadow-xl',
                active
                  ? 'shadow-lg'
                  : 'border-transparent hover:border-[color:var(--border-strong)]'
              )}
              style={
                active
                  ? { borderColor: c.color, background: c.bg, boxShadow: `0 8px 24px ${c.color}22` }
                  : { background: 'var(--bg-glass)' }
              }
              aria-pressed={active}
            >
              <span className="text-2xl">{c.emoji}</span>
              <span className="font-extrabold text-base tracking-tight" style={active ? { color: c.color } : undefined}>
                {c.title}
              </span>
              <span className="text-xs text-[color:var(--text-2)] leading-relaxed">{c.tagline}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
