'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { WORK_ANIMALS, WA_QUESTIONS, computeWorkAnimalWinner } from '@/lib/corpus/work-animals';
import { Button } from '@/components/common/Button';
import { Pill } from '@/components/common/Pill';
import { cn } from '@/lib/utils';
import type { WorkAnimalKey } from '@/types';

type Phase = 'intro' | 'quiz' | 'result';

export function WorkAnimalQuiz({ onFinished }: { onFinished: () => void }) {
  const setWorkAnimal = useAppStore((s) => s.setWorkAnimal);
  const existing = useAppStore((s) => s.workAnimal);

  const [phase, setPhase] = useState<Phase>(existing ? 'result' : 'intro');
  const [qIdx, setQIdx] = useState(0);
  const [scores, setScores] = useState<Record<WorkAnimalKey, number>>({
    owl: 0, fox: 0, bear: 0, dolphin: 0, eagle: 0, ant: 0,
  });
  const [picked, setPicked] = useState<number | null>(null);
  const [winner, setWinner] = useState<{ winner: WorkAnimalKey; secondary?: WorkAnimalKey } | null>(
    existing ? { winner: existing.key, secondary: existing.secondary } : null
  );

  const start = () => {
    setPhase('quiz');
    setQIdx(0);
    setScores({ owl: 0, fox: 0, bear: 0, dolphin: 0, eagle: 0, ant: 0 });
    setPicked(null);
  };

  const skip = () => {
    setPhase('result');
    setWinner(null);
    setWorkAnimal(null);
    onFinished();
  };

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    const opt = WA_QUESTIONS[qIdx].options[i];
    const next = { ...scores };
    for (const [k, v] of Object.entries(opt.scores) as Array<[WorkAnimalKey, number]>) {
      next[k] = (next[k] || 0) + v;
    }
    setScores(next);
    setTimeout(() => {
      setPicked(null);
      if (qIdx + 1 >= WA_QUESTIONS.length) {
        const result = computeWorkAnimalWinner(next);
        setWinner({ winner: result.winner, secondary: result.secondary });
        setWorkAnimal({ key: result.winner, scores: next, secondary: result.secondary });
        setPhase('result');
      } else {
        setQIdx(qIdx + 1);
      }
    }, 280);
  };

  if (phase === 'intro') {
    return (
      <div className="flex flex-col gap-3">
        <div className="p-4 rounded-md border-l-[3px] border-l-[color:var(--yellow)] bg-[color:rgba(250,204,21,0.05)]">
          <strong className="text-sm">🐾 Your Work Animal — the Menagerie Method</strong>
          <p className="text-sm text-[color:var(--text-2)] mt-1 leading-relaxed">
            A short 8-question read on how you work best. We use Talentbank&apos;s Work Animal framework — not
            MBTI or DISC — to add a working-style dimension to your career shape. Your answers stay yours.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={start}>Begin the quiz →</Button>
          <Button variant="ghost" onClick={skip}>Skip for now</Button>
        </div>
      </div>
    );
  }

  if (phase === 'quiz') {
    const q = WA_QUESTIONS[qIdx];
    const progress = ((qIdx) / WA_QUESTIONS.length) * 100;
    return (
      <div className="flex flex-col gap-3.5 animate-in fade-in slide-in-from-bottom-1 duration-200">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--text-3)]">
            Question {qIdx + 1} of {WA_QUESTIONS.length}
          </span>
          <Button variant="ghost" size="sm" onClick={skip}>Skip quiz</Button>
        </div>
        <div className="h-1 rounded bg-[color:var(--bg-elevated)] overflow-hidden">
          <div
            className="h-full rounded bg-gradient-to-r from-[color:var(--yellow)] to-[color:var(--teal)] transition-[width] duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <h3 className="text-lg font-extrabold tracking-tight">{q.q}</h3>
        <div className="flex flex-col gap-2">
          {q.options.map((o, i) => (
            <button
              key={i}
              type="button"
              onClick={() => pick(i)}
              disabled={picked !== null}
              className={cn(
                'p-3.5 text-left rounded-md border transition-all',
                'border-[color:var(--border)] bg-[color:var(--bg-glass)]',
                'hover:bg-[color:var(--bg-glass-strong)] hover:border-[color:var(--accent)] hover:translate-x-0.5',
                picked === i && 'bg-[color:var(--accent-glow)] border-[color:var(--accent)] scale-[0.98]'
              )}
            >
              <span className="text-sm">{o.text}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Result
  if (!winner) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-[color:var(--text-2)]">
          Quiz skipped — you can retake it later from your profile.
        </p>
      </div>
    );
  }

  const w = WORK_ANIMALS[winner.winner];
  const sec = winner.secondary ? WORK_ANIMALS[winner.secondary] : undefined;
  const total = (Object.values(scores) as number[]).reduce((s, n) => s + n, 0) || 1;
  const sortedScores = (Object.entries(scores) as Array<[WorkAnimalKey, number]>).sort((a, b) => b[1] - a[1]);

  return (
    <div className="flex flex-col gap-3.5 animate-in fade-in slide-in-from-bottom-1 duration-300">
      {/* Result hero */}
      <div
        className="flex gap-4 items-center p-4 rounded-lg border"
        style={{ borderColor: `var(${w.colorVar})`, background: 'var(--bg-glass)' }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-4xl flex-shrink-0"
          style={{ background: `var(${w.colorVar})20` }}
        >
          {w.emoji}
        </div>
        <div className="flex flex-col">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
            Your Work Animal
          </span>
          <h4 className="text-xl font-extrabold tracking-tight">
            {w.name}
            <span className="ml-2 font-medium text-[color:var(--text-2)] text-base">· {w.tagline}</span>
          </h4>
          <p className="text-xs text-[color:var(--text-2)] mt-1 leading-relaxed">{w.description}</p>
        </div>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        <div className="p-3 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)]">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
            Working Strengths
          </span>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {w.strengths.map((s) => <Pill key={s} variant="acquired">{s}</Pill>)}
          </div>
        </div>
        <div className="p-3 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)]">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
            Career Fit · Where {w.name}s tend to thrive
          </span>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {w.careerFit.map((s) => <Pill key={s} variant="bridge">{s}</Pill>)}
          </div>
        </div>
      </div>

      {sec && (
        <div className="p-3 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)]">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
            Secondary trait
          </span>
          <p className="text-xs text-[color:var(--text-2)] mt-1.5 leading-relaxed">
            You lean toward{' '}
            <strong style={{ color: `var(${sec.colorVar})` }}>
              {sec.emoji} {sec.name}
            </strong>{' '}
            as a secondary — a {sec.tagline.toLowerCase()} edge. The Engine factors this into your Path Navigator + AI Coach.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
          Full breakdown
        </span>
        {sortedScores.map(([k, val]) => {
          const a = WORK_ANIMALS[k];
          const pct = Math.round((val / total) * 100);
          return (
            <div key={k} className="grid grid-cols-[110px_1fr_50px] items-center gap-2.5 py-1">
              <span className="text-xs font-semibold text-[color:var(--text-2)]">
                {a.emoji} {a.name}
              </span>
              <div className="h-1.5 rounded bg-[color:var(--bg-elevated)] overflow-hidden">
                <div className="h-full transition-[width] duration-700 ease-out" style={{ width: `${pct}%`, background: `var(${a.colorVar})` }} />
              </div>
              <span className="font-mono text-[10px] text-[color:var(--text-3)] text-right">{pct}%</span>
            </div>
          );
        })}
      </div>

      <Button variant="ghost" size="sm" onClick={start} className="self-start">
        Retake quiz
      </Button>
    </div>
  );
}
