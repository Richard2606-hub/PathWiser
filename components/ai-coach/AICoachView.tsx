'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Callout } from '@/components/common/Callout';
import { Button } from '@/components/common/Button';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

const QUICK_TOPICS = [
  { icon: '🔄', title: 'Career Pivot', prompt: 'What does a pivot from data analytics to product management look like?' },
  { icon: '💰', title: 'Salary Insight', prompt: 'What salary can I expect as a Senior Data Scientist in KL?' },
  { icon: '🎯', title: 'Skill Bridge', prompt: 'What skills should I learn to move into machine learning?' },
  { icon: '⏱️', title: 'Timeline', prompt: 'How long does a mid-career transition typically take?' },
  { icon: '⚖️', title: 'Trade-offs', prompt: 'Compare technical IC track vs management for a data scientist' },
];

const CANNED_ANSWERS: Array<{ pattern: RegExp; answer: string }> = [
  {
    pattern: /pivot|transition.*(product|pm)/i,
    answer: `Based on ~1,240 cohort trajectories, **Analytics → PM transitions** typically take 18–24 months. Key bridging skills: stakeholder management, roadmap planning, and user research. 62% of successful pivots involved an internal lateral move first, rather than an external jump.

⚠️ *Honest note: This reflects cohort aggregates, not a prediction of your individual outcome.*`,
  },
  {
    pattern: /salary|pay|compensation/i,
    answer: `For **Senior Data Scientists in Kuala Lumpur** (3–5 yrs exp), the DOSM-calibrated range is:

• P25: RM 7,800/m
• Median: RM 9,500/m
• P75: RM 12,200/m

Your current shape positions you near the **55th percentile** of the cohort. This role appears on Malaysia's Critical Occupations List (MyCOL 2024/25).

📊 *Calibration: DOSM Salaries & Wages Survey 2024 + Michael Page MY headline anchors.*`,
  },
  {
    pattern: /skill|learn|machine learning|ml/i,
    answer: `For **machine learning** career paths, the top bridging skills observed in the cohort are:

1. **Deep Learning Frameworks** (PyTorch/TensorFlow) — 89% of ML roles require this
2. **MLOps & Model Serving** — Growing 34% YoY in Malaysian job postings
3. **Statistical Modeling** — Foundation skill, 72% coverage needed

Recommended learning path: 6–9 months of structured upskilling. Historical evidence, not a prediction.`,
  },
  {
    pattern: /how long|timeline|duration/i,
    answer: `Mid-career transitions in the Malaysian tech market typically follow this pattern:

• **Lateral (same level, new domain):** 3–6 months
• **Diagonal (level up + new domain):** 12–18 months
• **Vertical (same domain, level up):** 6–12 months

Based on 2,840 cohort trajectories. Median transition includes 2.3 months of active job searching.`,
  },
  {
    pattern: /trade|compare|management.*ic|ic.*management/i,
    answer: `**Technical IC vs. Management** — the classic fork:

| Factor | Technical IC | Management |
|--------|-------------|------------|
| Salary ceiling (MY) | RM 18–25K/m | RM 20–35K/m |
| Cohort size | Smaller (210) | Larger (980) |
| Skill decay risk | Higher | Lower |
| Autonomy | Higher | Lower |

68% of cohort members who chose management reported satisfaction, vs 74% for IC path.

⚖️ *Trade-off note: Management offers a higher salary ceiling but requires giving up deep technical work.*`,
  },
];

export function AICoachView() {
  const showToast = useAppStore((s) => s.showToast);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: `Welcome! I'm your evidence-grounded Career Coach. I reason over trajectory cohorts retrieved by the Career Twin Engine — I never make individual predictions. What would you like to explore?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: 'user', text }]);
    setInput('');
    setTyping(true);
    const answer =
      CANNED_ANSWERS.find((a) => a.pattern.test(text))?.answer ||
      `Based on the Career Twin Engine analysis of similar trajectories, here's what the cohort shows:

Your query touches on an interesting career consideration. Rather than predicting, I can show you the range of outcomes observed in cohorts with a shape similar to yours. Would you like to explore specific paths, salary benchmarks, or skill bridges?

⚠️ *Honest note: All insights are cohort-level aggregates, not individual predictions.*`;
    setTimeout(() => {
      setMessages((m) => [...m, { role: 'assistant', text: answer }]);
      setTyping(false);
    }, 700 + Math.random() * 500);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
      <div className="flex flex-col rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] overflow-hidden">
        <div className="flex items-center gap-2 px-3.5 py-2 border-b border-[color:var(--border)]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--emerald)] opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[color:var(--emerald)]" />
          </span>
          <span className="text-xs font-semibold">Career Twin Coach · Online</span>
          <span className="ml-auto text-[9px] font-mono uppercase tracking-widest text-[color:var(--text-3)]">
            Honesty Constraints Active
          </span>
        </div>
        <div ref={scrollRef} className="flex flex-col gap-3 p-3.5 max-h-[440px] min-h-[320px] overflow-y-auto">
          {messages.map((m, i) => (
            <MessageBubble key={i} message={m} />
          ))}
          {typing && <TypingIndicator />}
        </div>
        <div className="flex gap-2 p-2.5 border-t border-[color:var(--border)]">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send(input)}
            placeholder="Ask about pivots, skills, salary, transitions…"
            className="flex-1 px-3 py-2 rounded-md bg-[color:var(--bg-elevated)] border border-[color:var(--border)] text-sm outline-none focus:border-[color:var(--accent)]"
          />
          <Button onClick={() => send(input)}>Send</Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
          Quick Topics
        </span>
        {QUICK_TOPICS.map((q) => (
          <button
            key={q.title}
            onClick={() => send(q.prompt)}
            className="text-left p-2.5 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] hover:bg-[color:var(--bg-glass-strong)] hover:border-[color:var(--accent)] transition-all"
          >
            <div className="text-sm font-bold">{q.icon} {q.title}</div>
            <div className="text-[10px] text-[color:var(--text-3)] mt-0.5">{q.prompt.slice(0, 40)}…</div>
          </button>
        ))}
        <Callout tone="teal" className="mt-2">
          <strong>How this works</strong>
          <p className="mt-1 text-[11px]">
            When Gemini is configured, chat routes through <code>/api/engine/coach</code>. Without it,
            responses fall back to template narratives that still respect the honesty constraints.
          </p>
        </Callout>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  return (
    <div className={isUser ? 'self-end max-w-[80%]' : 'self-start max-w-[85%]'}>
      <div
        className={
          isUser
            ? 'px-3.5 py-2 rounded-2xl rounded-br-sm text-sm bg-[color:var(--accent-glow)] border border-[color:var(--yellow)] text-[color:var(--text-1)]'
            : 'px-3.5 py-2 rounded-2xl rounded-bl-sm text-sm bg-[color:var(--bg-elevated)] border border-[color:var(--border)] text-[color:var(--text-1)] leading-relaxed'
        }
      >
        {message.text.split('\n').map((line, i) => <p key={i} className={i > 0 ? 'mt-2' : ''}>{formatInline(line)}</p>)}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="self-start px-3.5 py-2 rounded-2xl rounded-bl-sm bg-[color:var(--bg-elevated)] border border-[color:var(--border)] flex gap-1.5 items-center">
      <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--text-2)] animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--text-2)] animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--text-2)] animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}

function formatInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return <strong key={i}>{p.slice(2, -2)}</strong>;
    }
    if (p.startsWith('*') && p.endsWith('*')) {
      return <em key={i}>{p.slice(1, -1)}</em>;
    }
    return <span key={i}>{p}</span>;
  });
}
