'use client';

import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { DEMO_PERSONAS } from '@/lib/corpus/personas';
import { Callout } from '@/components/common/Callout';
import { Button } from '@/components/common/Button';

interface Message { role: 'user' | 'assistant'; text: string; }
const QUICK_TOPICS = [
  { title: 'Career pivot', prompt: 'What cohort evidence should I consider before moving from data analytics into product management?' },
  { title: 'Salary context', prompt: 'What salary ranges appear around the realistic next roles in my cohort?' },
  { title: 'Skill bridge', prompt: 'Which skill bridges are most common for people moving toward machine learning?' },
  { title: 'Trade-offs', prompt: 'Compare the trade-offs between a technical individual-contributor path and management.' },
];

export function AICoachView() {
  const showToast = useAppStore((state) => state.showToast);
  const shape = useAppStore((state) => state.shape) || DEMO_PERSONAS.aisyah.shape;
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', text: 'Welcome. I reason only over a retrieved trajectory cohort and never predict an individual outcome. What decision would you like to examine?' }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [serviceState, setServiceState] = useState<'ready'|'unavailable'>('ready');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, [messages, typing]);

  const send = async (text: string) => {
    const question = text.trim(); if (!question || typing) return;
    const history = messages.slice(-10).map((item) => ({ role: item.role, content: item.text }));
    setMessages((current) => [...current, { role: 'user', text: question }]); setInput(''); setTyping(true);
    try {
      const response = await fetch('/api/engine/coach', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shape, message: question, history }) });
      const body = await response.json(); if (!response.ok) throw new Error(body.message || 'Evidence service failed.');
      setMessages((current) => [...current, { role: 'assistant', text: body.reply }]); setServiceState('ready');
      if (body.fallback_reason === 'provider_unavailable') showToast('The AI provider was unavailable, so PathWiser used a deterministic evidence summary.', 'warn');
      else if (body.fallback_reason === 'validation_failed') showToast('The generated answer failed honesty validation, so PathWiser used a deterministic evidence summary.', 'warn');
    } catch (error) {
      setMessages((current) => [...current, { role: 'assistant', text: 'I cannot retrieve a publishable trajectory cohort right now, so I will not generate advice or numbers from memory. Please try again when the evidence service is available.' }]);
      setServiceState('unavailable'); showToast(error instanceof Error ? error.message : 'Evidence service unavailable.', 'error');
    } finally { setTyping(false); }
  };

  return <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
    <section className="flex flex-col overflow-hidden rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)]" aria-labelledby="coach-title">
      <div className="flex items-center gap-2 border-b border-[color:var(--border)] px-3.5 py-2"><span className={`h-2 w-2 rounded-full ${serviceState === 'ready' ? 'bg-[color:var(--emerald)]' : 'bg-[color:var(--rose)]'}`} /><h2 id="coach-title" className="text-xs font-semibold">Career Twin Coach · {serviceState === 'ready' ? 'Evidence ready' : 'Evidence unavailable'}</h2><span className="ml-auto font-mono text-[9px] uppercase text-[color:var(--text-3)]">Honesty validation active</span></div>
      <div ref={scrollRef} className="flex min-h-[340px] max-h-[480px] flex-col gap-3 overflow-y-auto p-3.5" aria-live="polite">{messages.map((message, index) => <MessageBubble key={`${message.role}-${index}`} message={message} />)}{typing && <div className="self-start rounded-2xl bg-[color:var(--bg-elevated)] px-3.5 py-2 text-xs">Retrieving and validating cohort evidence…</div>}</div>
      <div className="flex gap-2 border-t border-[color:var(--border)] p-2.5"><label htmlFor="coach-question" className="sr-only">Question for the Career Twin Coach</label><input id="coach-question" value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void send(input); }} maxLength={2000} placeholder="Ask about options, bridges, ranges, or trade-offs" className="community-input flex-1" /><Button onClick={() => void send(input)} disabled={typing || !input.trim()}>Send</Button></div>
    </section>
    <aside className="flex flex-col gap-2"><span className="font-mono text-[10px] uppercase text-[color:var(--text-2)]">Evidence questions</span>{QUICK_TOPICS.map((topic) => <button key={topic.title} type="button" onClick={() => void send(topic.prompt)} disabled={typing} className="rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] p-3 text-left transition hover:border-[color:var(--yellow)] disabled:opacity-50"><strong className="text-sm">{topic.title}</strong><span className="mt-1 block text-[11px] text-[color:var(--text-3)]">{topic.prompt}</span></button>)}<Callout tone="teal"><strong>How answers are controlled</strong><p className="mt-1">A fresh cohort is retrieved for the saved shape. Unknown numbers and predictive language are prohibited. A failed validation is replaced by a deterministic cohort summary.</p></Callout></aside>
  </div>;
}

function MessageBubble({ message }: { message: Message }) {
  const user = message.role === 'user';
  return <div className={user ? 'max-w-[82%] self-end' : 'max-w-[88%] self-start'}><div className={user ? 'rounded-2xl rounded-br-sm border border-[color:var(--yellow)] bg-[color:var(--accent-glow)] px-3.5 py-2 text-sm' : 'rounded-2xl rounded-bl-sm border border-[color:var(--border)] bg-[color:var(--bg-elevated)] px-3.5 py-2 text-sm leading-relaxed'}>{message.text.split('\n').map((line, index) => <p key={index} className={index ? 'mt-2' : ''}>{formatInline(line)}</p>)}</div></div>;
}

function formatInline(text: string) { return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, index) => part.startsWith('**') && part.endsWith('**') ? <strong key={index}>{part.slice(2,-2)}</strong> : part.startsWith('*') && part.endsWith('*') ? <em key={index}>{part.slice(1,-1)}</em> : <span key={index}>{part}</span>); }
