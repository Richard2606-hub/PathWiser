import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileDrawer } from '@/components/layout/MobileDrawer';
import { LockedExplainer } from '@/components/layout/LockedExplainer';
import { ToastLayer } from '@/components/common/Toast';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative">
      {/* Backdrop layers */}
      <div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none z-[2]"
        style={{
          background: 'radial-gradient(ellipse at 50% 20%, transparent 0%, var(--bg-base) 75%)',
        }}
      />

      <div className="relative z-10 pb-16">
        {/* Engine pipeline strip */}
        <EnginePipeline />
        <Header />

        <div className="grid gap-3.5 mx-2.5 lg:grid-cols-[300px_1fr]">
          <div className="hidden lg:block sticky top-[100px] max-h-[calc(100vh-120px)] overflow-y-auto rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-glass)]">
            <Sidebar />
          </div>
          <main className="rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-glass)] overflow-hidden">
            {children}
          </main>
        </div>

        {/* Mobile drawer, overlays */}
        <MobileDrawer />
        <LockedExplainer />
        <ToastLayer />
      </div>
    </div>
  );
}

function EnginePipeline() {
  const stages = [
    { key: 'shape', label: 'Shape' },
    { key: 'retrieval', label: 'Retrieval' },
    { key: 'aggregation', label: 'Aggregation' },
    { key: 'narrative', label: 'Narrative' },
    { key: 'validation', label: 'Validation' },
    { key: 'delivery', label: 'Delivery' },
  ];
  return (
    <div className="mx-2.5 mt-2.5 mb-3 flex items-center gap-1 sm:gap-2 overflow-x-auto scroll-smooth rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-glass)] backdrop-blur px-3 py-2">
      {stages.map((s, i) => (
        <div key={s.key} className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 rounded-full border border-[color:var(--yellow)] bg-[color:var(--accent-glow)] px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--yellow)] shadow-[0_0_8px_var(--yellow)]" />
            <span className="font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[color:var(--yellow)]">
              {s.label}
            </span>
          </div>
          {i < stages.length - 1 && (
            <span className="font-mono text-xs text-[color:var(--text-3)]">→</span>
          )}
        </div>
      ))}
    </div>
  );
}
