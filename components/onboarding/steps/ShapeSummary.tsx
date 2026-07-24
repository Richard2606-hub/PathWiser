'use client';

import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { WORK_ANIMALS } from '@/lib/corpus/work-animals';
import { Callout } from '@/components/common/Callout';
import type { Persona } from '@/types';

/**
 * Final onboarding step — the "your career shape is ready" screen.
 * Renders a live SVG shape radar + engine metrics.
 */
export function ShapeSummary({
  persona,
  name,
  role,
  skills,
}: {
  persona: Persona;
  name?: string;
  role?: string;
  skills?: string[];
}) {
  const workAnimal = useAppStore((s) => s.workAnimal);
  const wa = workAnimal ? WORK_ANIMALS[workAnimal.key] : null;

  const dims = ['Technical', 'Domain', 'Leadership', 'Analytics', 'Communication'];
  const skillCount = skills?.length ?? 4;

  // Derive shape values from role + skills for a semi-realistic radar
  const values = useMemo(() => {
    const base = [65, 50, 30, 75, 45];
    if (role?.toLowerCase().includes('senior') || role?.toLowerCase().includes('lead')) {
      base[2] += 30; base[4] += 20;
    }
    if ((skills || []).some((s) => /python|ml|analytics|data/i.test(s))) {
      base[3] += 10; base[0] += 5;
    }
    if (persona === 'employer') return [40, 70, 80, 60, 85];
    if (persona === 'university') return [70, 85, 75, 70, 80];
    return base.map((v) => Math.min(100, v));
  }, [role, skills, persona]);

  return (
    <div className="flex flex-col gap-4">
      <Callout tone="emerald">
        <strong>✅ Profile Mapped Successfully</strong>
        <p className="mt-1">
          We&apos;ve structured your information into a reviewable &ldquo;Career Shape&rdquo;. The engine uses it to retrieve a privacy-safe cohort from the currently configured evidence source, which is labelled as community or modelled on every result.
        </p>
      </Callout>

      <div className="flex justify-center py-2">
        <ShapeRadar dims={dims} values={values} size={260} accent={wa ? `var(${wa.colorVar})` : 'var(--yellow)'} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Metric label="Audience" value={persona.charAt(0).toUpperCase() + persona.slice(1)} />
        <Metric label="Skills mapped" value={skillCount.toString()} />
        <Metric label="Evidence state" value="Ready to retrieve" />
        {wa ? (
          <Metric label="Work Animal" value={`${wa.emoji} ${wa.name}`} color={`var(${wa.colorVar})`} />
        ) : (
          <Metric label="Profile status" value="Reviewable" />
        )}
      </div>

      {name && <p className="text-xs text-[color:var(--text-3)] font-mono text-center">Welcome, {name}.</p>}
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex flex-col gap-0.5 p-2.5 rounded bg-[color:var(--bg-elevated)] border border-[color:var(--border)]">
      <span className="text-[9px] text-[color:var(--text-3)] font-mono uppercase tracking-wider">{label}</span>
      <span className="text-xs font-bold" style={color ? { color } : undefined}>{value}</span>
    </div>
  );
}

function ShapeRadar({
  dims,
  values,
  size = 260,
  accent = 'var(--yellow)',
}: {
  dims: string[];
  values: number[];
  size?: number;
  accent?: string;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 40;

  const angle = (i: number) => (Math.PI * 2 * i) / dims.length - Math.PI / 2;
  const point = (i: number, mag: number) => ({
    x: cx + Math.cos(angle(i)) * (r * mag),
    y: cy + Math.sin(angle(i)) * (r * mag),
  });

  const gridPolygon = (mag: number) =>
    dims.map((_, i) => {
      const p = point(i, mag);
      return `${p.x},${p.y}`;
    }).join(' ');

  const dataPoints = values.map((v, i) => point(i, v / 100));
  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      {/* Grid rings */}
      {[0.25, 0.5, 0.75, 1].map((m) => (
        <polygon
          key={m}
          points={gridPolygon(m)}
          fill="none"
          stroke="rgba(250,204,21,0.1)"
          strokeWidth={1}
        />
      ))}
      {/* Axis lines */}
      {dims.map((_, i) => {
        const end = point(i, 1);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={end.x}
            y2={end.y}
            stroke="rgba(250,204,21,0.14)"
            strokeWidth={1}
          />
        );
      })}
      {/* Data polygon */}
      <polygon
        points={dataPolygon}
        fill={accent}
        fillOpacity={0.15}
        stroke={accent}
        strokeWidth={2}
      />
      {/* Dots + labels */}
      {values.map((v, i) => {
        const p = point(i, v / 100);
        const labelP = point(i, 1.18);
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={4} fill={accent} />
            <text
              x={labelP.x}
              y={labelP.y}
              fill="var(--text-2)"
              fontSize={10}
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily="var(--sans)"
            >
              {dims[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
