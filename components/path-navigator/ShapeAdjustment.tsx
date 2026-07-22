'use client';

import { useAppStore, DEFAULT_SHAPE_SLIDERS } from '@/store/useAppStore';
import type { ShapeDimensions } from '@/types';

const DIMS: Array<{ key: keyof ShapeDimensions; label: string }> = [
  { key: 'technical', label: 'Technical' },
  { key: 'domain', label: 'Domain' },
  { key: 'leadership', label: 'Leadership' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'communication', label: 'Communication' },
];

export function ShapeAdjustment() {
  const shape = useAppStore((state) => state.shape);
  const updateShapeSlider = useAppStore((state) => state.updateShapeSlider);
  const values = { ...DEFAULT_SHAPE_SLIDERS, ...shape?.dimensions };

  return (
    <details className="group rounded-xl border border-[color:var(--border)] bg-white shadow-sm" aria-labelledby="shape-adjustment-title">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
        <span><strong id="shape-adjustment-title" className="text-sm">Adjust what matters to you</strong><span className="ml-2 hidden text-xs text-[color:var(--text-2)] sm:inline">Fine-tune the landscape using five capability dimensions.</span></span>
        <span className="text-xs font-semibold text-[color:var(--yellow)] group-open:hidden">Adjust profile +</span><span className="hidden text-xs font-semibold text-[color:var(--yellow)] group-open:inline">Done</span>
      </summary>
      <div className="flex flex-col gap-2.5 border-t border-[color:var(--border)] px-4 py-4">
        {DIMS.map((dimension) => (
          <div key={dimension.key} className="grid grid-cols-[100px_1fr_48px] items-center gap-2.5">
            <label htmlFor={`shape-${dimension.key}`} className="text-xs text-[color:var(--text-2)]">{dimension.label}</label>
            <input
              id={`shape-${dimension.key}`}
              type="range"
              min={0}
              max={100}
              value={values[dimension.key]}
              aria-valuetext={`${values[dimension.key]} out of 100`}
              onChange={(event) => updateShapeSlider(dimension.key, Number(event.target.value))}
              className="pw-slider"
            />
            <output htmlFor={`shape-${dimension.key}`} className="text-[11px] font-mono text-[color:var(--text-2)] text-right tabular-nums">
              {values[dimension.key]}
            </output>
          </div>
        ))}
      </div>
      <style jsx>{`
        .pw-slider { appearance: none; height: 5px; background: var(--bg-elevated); border-radius: 99px; cursor: pointer; outline: none; }
        .pw-slider:focus-visible { box-shadow: 0 0 0 3px var(--accent-glow); }
        .pw-slider::-webkit-slider-thumb { appearance: none; width: 18px; height: 18px; border-radius: 50%; background: var(--yellow); box-shadow: 0 0 0 4px rgba(79,70,229,0.12); }
        .pw-slider::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%; background: var(--yellow); border: none; box-shadow: 0 0 0 4px rgba(79,70,229,0.12); }
      `}</style>
    </details>
  );
}
