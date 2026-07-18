import { SDG_META, MODULE_SDGS } from '@/lib/corpus/sdgs';

export function SdgStrip({ moduleKey }: { moduleKey: string }) {
  const sdgs = MODULE_SDGS[moduleKey];
  if (!sdgs || sdgs.length === 0) return null;
  return (
    <div className="flex items-center gap-1.5 mt-2.5 flex-wrap" aria-label="UN SDG alignment">
      <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[color:var(--text-3)] mr-1">
        UN SDG
      </span>
      {sdgs.map((n) => {
        const s = SDG_META[n];
        return (
          <span
            key={n}
            title={`SDG ${s.num} — ${s.name}`}
            className="inline-flex items-center justify-center w-6 h-6 rounded-full font-mono text-[11px] font-extrabold text-white shadow-md hover:scale-110 transition-transform cursor-help"
            style={{ background: s.color }}
          >
            {s.num}
          </span>
        );
      })}
    </div>
  );
}
