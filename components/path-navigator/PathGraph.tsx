'use client';

import { useState } from 'react';
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
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Root "YOU" node position
  const you = { id: '__you', label: 'YOU', x: 85, y: 210, r: 24 };

  const maxProb = Math.max(0.0001, ...nodes.map((n) => n.probability));
  const rel = (p: number) => p / maxProb; // 0..1, leader = 1

  const handleClick = (id: string) => {
    if (compareMode) {
      if (compareNodes.includes(id)) removeCompareNode(id);
      else addCompareNode(id);
    } else {
      onNodeClick(id);
    }
  };

  // Helper for generating smooth horizontal Bezier curves
  const getBezierPath = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = x2 - x1;
    const cx1 = x1 + dx * 0.45;
    const cy1 = y1;
    const cx2 = x1 + dx * 0.55;
    const cy2 = y2;
    return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
  };

  return (
    <>
      {/* Mobile Card List View */}
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
                    ? 'border-[color:var(--accent)] bg-[color:var(--accent-glow)] shadow-sm'
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
                    MyCOL priority role ✦
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Desktop Interactive Flowchart Canvas */}
      <div className="hidden w-full aspect-[16/9] max-h-[440px] overflow-visible sm:block">
        <svg viewBox="0 0 760 420" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" role="group" aria-labelledby="career-graph-title career-graph-desc">
          <title id="career-graph-title">Career Path Map</title>
          <desc id="career-graph-desc">Explore next role destinations and trajectory share for your career path.</desc>
          
          <defs>
            <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
            <linearGradient id="activeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>

            <linearGradient id="leaderGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0f9f8f" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Stage Headers */}
          <g opacity="0.6" textAnchor="middle" fontSize="9" fontWeight="700" fontFamily="var(--mono)" letterSpacing="0.1em">
            <text x={you.x} y="28" fill="var(--text-3)">YOUR ROLE</text>
            <text x="340" y="28" fill="var(--text-3)">DIRECT TRANSITIONS</text>
            <text x="580" y="28" fill="var(--text-3)">ADVANCED TARGETS</text>
            
            {/* Subtle column guide lines */}
            <line x1={you.x} y1="38" x2={you.x} y2="395" stroke="var(--border)" strokeDasharray="3 3" strokeWidth="0.75" />
            <line x1="340" y1="38" x2="340" y2="395" stroke="var(--border)" strokeDasharray="3 3" strokeWidth="0.75" />
            <line x1="580" y1="38" x2="580" y2="395" stroke="var(--border)" strokeDasharray="3 3" strokeWidth="0.75" />
          </g>

          {/* Curved Bezier Connectors */}
          {nodes.map((n, idx) => {
            const isSelected = selectedNode === n.id && !compareMode;
            const isInCompare = compareMode && compareNodes.includes(n.id);
            const isHovered = hoveredNode === n.id;
            const active = isSelected || isInCompare || isHovered;

            const isLeader = idx === 0;
            const pathD = getBezierPath(you.x, you.y, n.x, n.y);

            let strokeColor = isLeader ? 'url(#leaderGradient)' : 'rgba(79, 70, 229, 0.35)';
            if (active) strokeColor = 'url(#activeGradient)';
            
            const strokeWidth = active ? 4 : isLeader ? 3 : 1.75 + rel(n.probability) * 1.5;
            const opacity = (selectedNode || hoveredNode) && !active ? 0.25 : 1;

            return (
              <g key={`edge-group-${n.id}`} style={{ opacity, transition: 'opacity 0.2s ease' }}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={active || isLeader ? undefined : '5 4'}
                  strokeLinecap="round"
                />
              </g>
            );
          })}

          {/* YOU Root Node */}
          <g>
            <circle cx={you.x} cy={you.y} r={you.r + 6} fill="none" stroke="var(--yellow)" strokeWidth="2" opacity="0.3" filter="url(#glow)" />
            <circle cx={you.x} cy={you.y} r={you.r} fill="var(--yellow)" />
            <text x={you.x} y={you.y + 4} fill="#ffffff" fontSize="10" fontWeight="800" textAnchor="middle" fontFamily="var(--mono)" pointerEvents="none">
              YOU
            </text>
            
            {/* YOU Label Shield */}
            <g transform={`translate(${you.x}, ${you.y + you.r + 14})`}>
              <rect x="-60" y="-10" width="120" height="20" rx="6" fill="var(--bg-surface)" stroke="var(--border)" strokeWidth="1" />
              <text x="0" y="4" fill="var(--text-1)" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="var(--sans)" pointerEvents="none">
                {currentRole}
              </text>
            </g>
          </g>

          {/* Destination Nodes */}
          {nodes.map((n, idx) => {
            const isSelected = selectedNode === n.id && !compareMode;
            const isInCompare = compareMode && compareNodes.includes(n.id);
            const isHovered = hoveredNode === n.id;
            const active = isSelected || isInCompare || isHovered;
            const isPrimary = idx === 0;

            const r = 18 + rel(n.probability) * 6;
            const labelWidth = Math.max(105, n.label.length * 6.5 + 16);
            const labelHeight = n.isMycol ? 30 : 20;

            return (
              <g
                key={n.id}
                className="path-graph-node cursor-pointer outline-none transition-transform"
                role="button"
                tabIndex={0}
                aria-label={`${n.label}, ${Math.round(n.probability * 100)} percent cohort share${n.isMycol ? ', MyCOL priority role' : ''}`}
                aria-pressed={active}
                onClick={() => handleClick(n.id)}
                onMouseEnter={() => setHoveredNode(n.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleClick(n.id);
                  }
                }}
                style={{ transformOrigin: `${n.x}px ${n.y}px`, transformBox: 'fill-box' }}
              >
                {/* Active / Compare / Selected Outer Halos */}
                {isInCompare && (
                  <circle cx={n.x} cy={n.y} r={r + 8} fill="none" stroke="var(--teal)" strokeWidth="2.5" pointerEvents="none" />
                )}
                {isSelected && (
                  <circle cx={n.x} cy={n.y} r={r + 8} fill="none" stroke="var(--yellow)" strokeWidth="2.5" filter="url(#glow)" pointerEvents="none" />
                )}

                {/* MyCOL Outer Ring */}
                {n.isMycol && (
                  <circle cx={n.x} cy={n.y} r={r + 5} fill="none" stroke="var(--sky)" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" pointerEvents="none" />
                )}

                {/* Node Body Circle */}
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={r}
                  fill={isPrimary ? 'var(--yellow)' : active ? '#4f46e5' : '#3b82f6'}
                  opacity={active ? 1 : 0.85}
                  className="transition-all duration-200"
                />

                {/* Percentage Text Inside Circle */}
                <text
                  x={n.x}
                  y={n.y + 4}
                  fill="#ffffff"
                  fontSize="10"
                  fontWeight="800"
                  textAnchor="middle"
                  fontFamily="var(--mono)"
                  pointerEvents="none"
                >
                  {(n.probability * 100).toFixed(0)}%
                </text>

                {/* Node Label Shield / Card Pill (Shields text against background lines) */}
                <g transform={`translate(${n.x}, ${n.y + r + 14})`}>
                  <rect
                    x={-labelWidth / 2}
                    y={-10}
                    width={labelWidth}
                    height={labelHeight}
                    rx="6"
                    fill="var(--bg-surface)"
                    stroke={active ? 'var(--accent)' : 'var(--border)'}
                    strokeWidth={active ? '1.5' : '1'}
                    className="shadow-sm transition-all"
                  />
                  
                  <text
                    x="0"
                    y={n.isMycol ? -1 : 3}
                    fill="var(--text-1)"
                    fontSize="9.5"
                    fontWeight={active || isPrimary ? '700' : '600'}
                    textAnchor="middle"
                    fontFamily="var(--sans)"
                    pointerEvents="none"
                  >
                    {n.label}
                  </text>

                  {n.isMycol && (
                    <text
                      x="0"
                      y="11"
                      fill="var(--sky)"
                      fontSize="7.5"
                      fontWeight="800"
                      fontFamily="var(--mono)"
                      textAnchor="middle"
                      pointerEvents="none"
                      letterSpacing="0.05em"
                    >
                      MyCOL ✦ PRIORITY
                    </text>
                  )}
                </g>

                {/* Top Match Micro Badge */}
                {isPrimary && (
                  <g transform={`translate(${n.x}, ${n.y - r - 12})`}>
                    <rect x="-32" y="-8" width="64" height="15" rx="4" fill="var(--yellow)" />
                    <text x="0" y="3" fill="#ffffff" fontSize="7.5" fontWeight="800" fontFamily="var(--mono)" textAnchor="middle" letterSpacing="0.06em">
                      TOP MATCH
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </>
  );
}
