'use client';

import { useAppStore } from '@/store/useAppStore';

interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  salary?: number;
  cohort: number;
  probability: number;
  isMycol?: boolean;
}

interface PathGraphProps {
  nodes: GraphNode[];
  currentRole: string;
  selectedNode: string | null;
  onNodeClick: (id: string) => void;
}

export function PathGraph({ nodes, currentRole, selectedNode, onNodeClick }: PathGraphProps) {
  const compareMode = useAppStore((s) => s.compareMode);
  const compareNodes = useAppStore((s) => s.compareNodes);
  const addCompareNode = useAppStore((s) => s.addCompareNode);
  const removeCompareNode = useAppStore((s) => s.removeCompareNode);

  // Root "YOU" node
  const you = { id: '__you', label: 'YOU', x: 80, y: 200, r: 22 };

  const handleClick = (id: string) => {
    if (compareMode) {
      if (compareNodes.includes(id)) removeCompareNode(id);
      else addCompareNode(id);
    } else {
      onNodeClick(id);
    }
  };

  return (
    <>
      <section className="sm:hidden" aria-labelledby="mobile-career-paths-title">
        <div className="mb-3">
          <h2 id="mobile-career-paths-title" className="text-sm font-bold">Your next-role landscape</h2>
          <p className="mt-1 text-xs leading-relaxed text-[color:var(--text-2)]">
            Tap a destination to inspect its evidence{compareMode ? ', or select up to three to compare' : ''}.
          </p>
        </div>
        <div className="grid gap-2">
          {nodes.map((node) => {
            const active = compareMode ? compareNodes.includes(node.id) : selectedNode === node.id;
            return (
              <button
                key={node.id}
                type="button"
                aria-pressed={active}
                onClick={() => handleClick(node.id)}
                className={`min-h-16 rounded-xl border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-[color:var(--accent)] focus-visible:outline-offset-2 ${
                  active
                    ? 'border-[color:var(--accent)] bg-[color:var(--accent-glow)]'
                    : 'border-[color:var(--border)] bg-[color:var(--bg-elevated)]'
                }`}
              >
                <span className="flex items-start justify-between gap-3">
                  <span>
                    <strong className="block text-sm">{node.label}</strong>
                    <span className="mt-1 block text-xs text-[color:var(--text-2)]">
                      {node.cohort.toLocaleString()} similar trajectories
                    </span>
                  </span>
                  <span className="rounded-full bg-[color:var(--yellow)] px-2.5 py-1 font-mono text-xs font-bold text-white">
                    {Math.round(node.probability * 100)}%
                  </span>
                </span>
                {node.isMycol && (
                  <span className="mt-2 inline-block font-mono text-[10px] font-bold uppercase tracking-wide text-[color:var(--sky)]">
                    MyCOL priority role
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <div className="hidden w-full aspect-[16/9] max-h-[420px] overflow-visible sm:block">
        <svg viewBox="0 0 760 420" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" role="group" aria-labelledby="career-graph-title career-graph-desc">
        <title id="career-graph-title">Career path destinations</title>
        <desc id="career-graph-desc">Choose a destination role to inspect it. Each node announces its observed cohort share.</desc>
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Edges */}
        {nodes.map((n) => (
          <line
            key={`e-${n.id}`}
            x1={you.x}
            y1={you.y}
            x2={n.x}
            y2={n.y}
            stroke="rgba(79,70,229,0.18)"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
        ))}

        {/* You node */}
        <circle cx={you.x} cy={you.y} r={you.r} fill="var(--yellow)" opacity="0.9" />
        <text x={you.x} y={you.y + 4} fill="var(--bg-base)" fontSize="10" fontWeight="800" textAnchor="middle" fontFamily="var(--mono)" pointerEvents="none">
          YOU
        </text>
        <text x={you.x} y={you.y + you.r + 14} fill="var(--text-2)" fontSize="9" textAnchor="middle" fontFamily="var(--sans)" pointerEvents="none">
          {currentRole}
        </text>

        {/* Destination nodes */}
        {nodes.map((n) => {
          const isSelected = selectedNode === n.id && !compareMode;
          const isInCompare = compareMode && compareNodes.includes(n.id);
          const r = 14 + Math.min(8, n.probability * 24);
          const fillOpacity = n.probability > 0.15 ? 0.95 : 0.5;

          return (
            <g
              key={n.id}
              className="path-graph-node cursor-pointer transition-transform outline-none"
              role="button"
              tabIndex={0}
              aria-label={`${n.label}, ${Math.round(n.probability * 100)} percent cohort share${n.isMycol ? ', MyCOL priority role' : ''}`}
              aria-pressed={isSelected || isInCompare}
              onClick={() => handleClick(n.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleClick(n.id);
                }
              }}
              style={{ transformOrigin: `${n.x}px ${n.y}px`, transformBox: 'fill-box' }}
            >
              {/* MyCOL ring */}
              {n.isMycol && (
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={r + 5}
                  fill="none"
                  stroke="var(--sky)"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                  opacity="0.7"
                  pointerEvents="none"
                />
              )}
              {/* Compare halo */}
              {isInCompare && (
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={r + 8}
                  fill="none"
                  stroke="var(--teal)"
                  strokeWidth="2.5"
                  pointerEvents="none"
                />
              )}
              {/* Selected halo */}
              {isSelected && (
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={r + 8}
                  fill="none"
                  stroke="var(--yellow)"
                  strokeWidth="2"
                  filter="url(#glow)"
                  pointerEvents="none"
                />
              )}
              {/* Node body */}
              <circle
                cx={n.x}
                cy={n.y}
                r={r}
                fill={n.probability > 0.15 ? 'var(--yellow)' : 'var(--text-3)'}
                opacity={fillOpacity}
              />
              {/* Probability label */}
              <text
                x={n.x}
                y={n.y + 3}
                fill="var(--bg-base)"
                fontSize="8"
                fontWeight="800"
                textAnchor="middle"
                fontFamily="var(--mono)"
                pointerEvents="none"
              >
                {(n.probability * 100).toFixed(0)}%
              </text>
              {/* Role label */}
              <text
                x={n.x}
                y={n.y + r + 14}
                fill="var(--text-2)"
                fontSize="9"
                textAnchor="middle"
                fontFamily="var(--sans)"
                pointerEvents="none"
              >
                {n.label}
              </text>
              {n.isMycol && (
                <text
                  x={n.x}
                  y={n.y + r + 25}
                  fill="var(--sky)"
                  fontSize="7"
                  fontFamily="var(--mono)"
                  textAnchor="middle"
                  pointerEvents="none"
                  letterSpacing="0.06em"
                >
                  MyCOL ✦
                </text>
              )}
            </g>
          );
        })}
        </svg>
        <style jsx>{`
          .path-graph-node:focus-visible circle:last-of-type {
            stroke: var(--text-1);
            stroke-width: 3px;
          }
        `}</style>
      </div>
    </>
  );
}
