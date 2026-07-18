'use client';

import { useState } from 'react';

const DIMS = [
  { key: 'technical',     label: 'Technical' },
  { key: 'domain',        label: 'Domain' },
  { key: 'leadership',    label: 'Leadership' },
  { key: 'analytics',     label: 'Analytics' },
  { key: 'communication', label: 'Communication' },
];

export function ShapeAdjustment() {
  const [values, setValues] = useState<Record<string, number>>({
    technical: 65, domain: 50, leadership: 30, analytics: 75, communication: 45,
  });

  return (
    <div className="p-3.5 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)]">
      <div className="flex items-center justify-between mb-2.5">
        <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
          Shape Adjustment Loop · Adjust and re-explore
        </span>
        <span className="text-[10px] italic text-[color:var(--text-3)]">
          Sliders below feed back into your shape for future engine calls.
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        {DIMS.map((d) => (
          <div key={d.key} className="grid grid-cols-[100px_1fr_40px] items-center gap-2.5">
            <label className="text-xs text-[color:var(--text-2)]">{d.label}</label>
            <input
              type="range"
              min={0}
              max={100}
              value={values[d.key]}
              onChange={(e) => setValues({ ...values, [d.key]: parseInt(e.target.value, 10) })}
              className="pw-slider"
            />
            <span className="text-[10px] font-mono text-[color:var(--text-3)] text-right tabular-nums">
              {values[d.key]}
            </span>
          </div>
        ))}
      </div>
      <style jsx>{`
        .pw-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 4px;
          background: var(--bg-elevated);
          border-radius: 99px;
          cursor: pointer;
          outline: none;
        }
        .pw-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px; height: 16px;
          border-radius: 50%;
          background: var(--yellow);
          box-shadow: 0 0 0 4px rgba(250,204,21,0.15);
          cursor: pointer;
          transition: transform 0.18s;
        }
        .pw-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }
        .pw-slider::-moz-range-thumb {
          width: 16px; height: 16px;
          border-radius: 50%;
          background: var(--yellow);
          border: none;
          box-shadow: 0 0 0 4px rgba(250,204,21,0.15);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
