'use client';

import { useEffect, useState } from 'react';
import { StatGrid, StatBox } from '@/components/common/StatBox';
import { Callout } from '@/components/common/Callout';

interface Summary { available: boolean; reason?: string; calls: number; p95_latency_ms: number | null; validation_pass_rate: number | null; modules: Array<{ module: string; calls: number }>; error?: string; }

export function AnalyticsView() {
  const [summary, setSummary] = useState<Summary | null>(null);
  useEffect(() => { void fetch('/api/analytics/summary').then(async (response) => ({ response, body: await response.json() })).then(({ response, body }) => setSummary(response.ok ? body : { available: false, reason: body.error === 'admin_required' ? 'Administrator access is required.' : body.error === 'authentication_required' ? 'Sign in with an administrator account.' : 'Analytics are unavailable.', calls: 0, p95_latency_ms: null, validation_pass_rate: null, modules: [] })).catch(() => setSummary({ available: false, reason: 'Analytics are unavailable.', calls: 0, p95_latency_ms: null, validation_pass_rate: null, modules: [] })); }, []);
  return <div className="flex flex-col gap-4"><Callout tone="rose"><strong>Internal operations surface</strong><p className="mt-1">Only authenticated platform administrators can read aggregate telemetry. No fabricated operational metrics are displayed.</p></Callout><StatGrid cols={4}><StatBox label="Engine calls (24h)" value={summary ? summary.calls.toLocaleString() : '…'} /><StatBox label="P95 latency" value={summary?.p95_latency_ms != null ? `${summary.p95_latency_ms}ms` : 'Not measured'} color="var(--sky)" /><StatBox label="Narrative validation" value={summary?.validation_pass_rate != null ? `${Math.round(summary.validation_pass_rate * 100)}%` : 'Not measured'} color="var(--teal)" /><StatBox label="Telemetry" value={summary?.available ? 'Connected' : 'Unavailable'} color="var(--yellow)" /></StatGrid>{summary && !summary.available ? <Callout tone="amber"><strong>Telemetry unavailable</strong><p className="mt-1">{summary.reason}</p></Callout> : <section className="rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] p-4"><h2 className="font-mono text-[10px] uppercase text-[color:var(--text-2)]">Calls by module</h2><div className="mt-3 flex flex-col gap-2">{summary?.modules.map((item) => <div key={item.module} className="flex justify-between rounded bg-[color:var(--bg-elevated)] p-2 text-xs"><span>{item.module}</span><strong>{item.calls}</strong></div>)}</div></section>}</div>;
}
