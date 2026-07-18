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
  selectedNode: string | null;
  onNodeClick: (id: string) => void;
}

export function PathGraph({ nodes, selectedNode, onNodeClick }: PathGraphProps) {
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
    <div className="w-full aspect-[16/9] max-h-[420px] overflow-visible">
      <svg viewBox="0 0 760 420" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
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
            stroke="rgba(250,204,21,0.15)"
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
          Junior Data Analyst
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
              className="cursor-pointer transition-transform"
              onClick={() => handleClick(n.id)}
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
    </div>
  );
}
