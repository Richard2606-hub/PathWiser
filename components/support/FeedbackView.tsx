'use client';

import { useState } from 'react';
import { StatGrid, StatBox } from '@/components/common/StatBox';
import { Callout } from '@/components/common/Callout';
import { Button } from '@/components/common/Button';

const SESSIONS = [
  { date: '2026-07-05', module: 'Path Navigator', rating: 4, note: 'Accurate salary ranges' },
  { date: '2026-07-04', module: 'AI Coach', rating: 5, note: 'Great pivot analysis' },
  { date: '2026-07-03', module: 'Fair Pay', rating: 3, note: 'Outdated Penang data' },
  { date: '2026-07-02', module: 'Talent Match', rating: 4, note: 'Good candidate ranking' },
];

export function FeedbackView() {
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState('');

  return (
    <div className="flex flex-col gap-4">
      <StatGrid cols={4}>
        <StatBox label="Total Sessions" value="1,284" />
        <StatBox label="Feedback Rate" value="34%" color="var(--teal)" />
        <StatBox label="Avg Accuracy" value="4.2/5" color="var(--yellow)" />
        <StatBox label="Corpus Updates" value="128" color="var(--sky)" />
      </StatGrid>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="p-4 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)]">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
            Recent Sessions
          </span>
          <div className="flex flex-col gap-2 mt-3">
            {SESSIONS.map((s) => (
              <div key={s.date} className="flex justify-between items-center p-2.5 rounded border border-[color:var(--border)] bg-[color:var(--bg-elevated)]">
                <div>
                  <div className="font-mono text-[9px] uppercase text-[color:var(--text-3)]">
                    {s.date} · {s.module}
                  </div>
                  <div className="text-xs text-[color:var(--text-2)] mt-0.5">{s.note}</div>
                </div>
                <span className="text-[color:var(--yellow)] text-xs tabular-nums">
                  {'★'.repeat(s.rating)}{'☆'.repeat(5 - s.rating)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="p-4 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)]">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
              Corpus Improvement Queue
            </span>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <Metric label="Pending Review" value="24" />
              <Metric label="Approved" value="104" />
              <Metric label="Rejected" value="12" />
              <Metric label="Queue Age" value="3.2 days" />
            </div>
          </div>

          <div className="p-4 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)]">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
              Leave feedback on the last engine output
            </span>
            <div className="mt-3 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  className="text-2xl transition-transform hover:scale-110"
                  style={{ color: n <= rating ? 'var(--yellow)' : 'var(--text-3)' }}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Anything specific to flag?"
              className="mt-3 w-full p-2.5 rounded bg-[color:var(--bg-elevated)] border border-[color:var(--border)] text-sm min-h-[70px] outline-none focus:border-[color:var(--accent)]"
            />
            <Button variant="primary" size="sm" className="mt-2" onClick={() => { setRating(0); setNote(''); }}>
              Submit → Corpus Queue
            </Button>
          </div>

          <Callout tone="emerald">
            <strong>Feedback Loop</strong>
            <p className="mt-1">
              Structured feedback (accuracy/freshness ratings) flows into the curation queue, informing
              corpus updates and prompt quality review.
            </p>
          </Callout>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 p-2 rounded bg-[color:var(--bg-elevated)] border border-[color:var(--border)]">
      <span className="text-[9px] text-[color:var(--text-3)] font-mono uppercase tracking-wider">{label}</span>
      <span className="text-xs font-bold tabular-nums">{value}</span>
    </div>
  );
}
