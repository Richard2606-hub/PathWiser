import { PanelHeader } from '@/components/layout/PanelHeader';
import { Callout } from '@/components/common/Callout';
import { StatGrid, StatBox } from '@/components/common/StatBox';
import { Pill } from '@/components/common/Pill';

const RLS_ROWS = [
  { role: 'Candidate', access: 'Own profile + anonymised cohort', level: 'Row-level' },
  { role: 'Employer', access: 'Consented candidate shapes only', level: 'Row-level + consent' },
  { role: 'University', access: 'Own graduates (anonymised)', level: 'Row-level + k-anon' },
  { role: 'Admin', access: 'Full (audit-logged)', level: 'Superuser' },
];

const CONSENT_FLOWS = [
  { flow: 'Profile Sharing', status: 'Active', revocable: 'Yes', count: '12,400' },
  { flow: 'Trajectory Contribution', status: 'Active', revocable: 'Yes', count: '28,400' },
  { flow: 'Employer Matching', status: 'Opt-in', revocable: 'Yes', count: '8,200' },
  { flow: 'Research (Anonymised)', status: 'Opt-in', revocable: 'Yes', count: '4,100' },
];

export default function SecurityPage() {
  return (
    <div>
      <PanelHeader moduleKey="security" />
      <div className="p-4 sm:p-5 flex flex-col gap-4">
        <Callout tone="rose">
          <strong>🛡️ Security Layer</strong>
          <p className="mt-1">
            Foundational layer enforcing authentication, row-level security, consent management, and
            anonymisation across all modules.
          </p>
        </Callout>

        <StatGrid cols={4}>
          <StatBox label="Active Policies" value="14" />
          <StatBox label="Consent Records" value="28,400" color="var(--teal)" />
          <StatBox label="RLS Rules" value="9" color="var(--violet)" />
          <StatBox label="k-Anonymity k=" value="5" color="var(--sky)" />
        </StatGrid>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="p-4 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)]">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
              Access Control · Row-Level Security
            </span>
            <table className="w-full text-xs mt-3">
              <thead>
                <tr>
                  <th className="text-left p-2 font-mono text-[9px] uppercase text-[color:var(--text-3)]">Role</th>
                  <th className="text-left p-2 font-mono text-[9px] uppercase text-[color:var(--text-3)]">Access Scope</th>
                  <th className="text-left p-2 font-mono text-[9px] uppercase text-[color:var(--text-3)]">Enforcement</th>
                </tr>
              </thead>
              <tbody>
                {RLS_ROWS.map((r) => (
                  <tr key={r.role} className="border-t border-[color:var(--border)]">
                    <td className="p-2 font-semibold">{r.role}</td>
                    <td className="p-2 text-[color:var(--text-2)]">{r.access}</td>
                    <td className="p-2"><Pill variant="acquired">{r.level}</Pill></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)]">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
              Consent Management · Active Flows
            </span>
            <table className="w-full text-xs mt-3">
              <thead>
                <tr>
                  <th className="text-left p-2 font-mono text-[9px] uppercase text-[color:var(--text-3)]">Flow</th>
                  <th className="text-left p-2 font-mono text-[9px] uppercase text-[color:var(--text-3)]">Status</th>
                  <th className="text-left p-2 font-mono text-[9px] uppercase text-[color:var(--text-3)]">Revocable</th>
                  <th className="text-right p-2 font-mono text-[9px] uppercase text-[color:var(--text-3)]">Records</th>
                </tr>
              </thead>
              <tbody>
                {CONSENT_FLOWS.map((c) => (
                  <tr key={c.flow} className="border-t border-[color:var(--border)]">
                    <td className="p-2 font-semibold">{c.flow}</td>
                    <td className="p-2">
                      <Pill variant={c.status === 'Active' ? 'acquired' : 'default'}>{c.status}</Pill>
                    </td>
                    <td className="p-2 text-[color:var(--text-2)]">{c.revocable}</td>
                    <td className="p-2 text-right font-mono tabular-nums">{c.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
