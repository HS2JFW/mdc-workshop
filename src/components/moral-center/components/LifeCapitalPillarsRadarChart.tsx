import React, { useState, useEffect, useMemo } from 'react';

export interface LifeCapitalPillarsRadarChartProps {
  pillars: {
    identity: number;
    family: number;
    talent: number;
    organization: number;
    friend: number;
    community: number;
  };
  selectedPillar?: string | null;
  onPillarClick?: (pillarKey: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

interface PillarConfig {
  key: 'family' | 'talent' | 'organization' | 'friend' | 'community' | 'identity';
  name: string;
  color: string;
  darkColor: string;
  midColor: string;
  lightColor: string;
  pillBg: string;
  pillBorder: string;
  textColor: string;
}

const PILLAR_CONFIGS: PillarConfig[] = [
  {
    key: 'family',
    name: 'พลังครอบครัว',
    color: '#ec4899',
    darkColor: '#db2777',
    midColor: '#f472b6',
    lightColor: '#fdf2f8',
    pillBg: '#fdf2f8',
    pillBorder: '#fbcfe8',
    textColor: '#be185d'
  },
  {
    key: 'talent',
    name: 'พลังสร้างปัญญา',
    color: '#7c3aed',
    darkColor: '#6d28d9',
    midColor: '#a78bfa',
    lightColor: '#ede9fe',
    pillBg: '#f5f3ff',
    pillBorder: '#ddd6fe',
    textColor: '#5b21b6'
  },
  {
    key: 'organization',
    name: 'พลังที่ทำงาน',
    color: '#059669',
    darkColor: '#047857',
    midColor: '#6ee7b7',
    lightColor: '#f0fdf4',
    pillBg: '#f0fdf4',
    pillBorder: '#bbf7d0',
    textColor: '#065f46'
  },
  {
    key: 'friend',
    name: 'พลังเพื่อนและกิจกรรม',
    color: '#d97706',
    darkColor: '#b45309',
    midColor: '#fcd34d',
    lightColor: '#fff7ed',
    pillBg: '#fff7ed',
    pillBorder: '#fed7aa',
    textColor: '#9a3412'
  },
  {
    key: 'community',
    name: 'พลังชุมชน',
    color: '#0284c7',
    darkColor: '#0369a1',
    midColor: '#38bdf8',
    lightColor: '#f0f9ff',
    pillBg: '#f0f9ff',
    pillBorder: '#bae6fd',
    textColor: '#0284c7'
  },
  {
    key: 'identity',
    name: 'พลังตัวตน',
    color: '#2563eb',
    darkColor: '#1d4ed8',
    midColor: '#93c5fd',
    lightColor: '#eff6ff',
    pillBg: '#eff6ff',
    pillBorder: '#bfdbfe',
    textColor: '#1e40af'
  }
];

function createHexagonConicBlend(R: number): string {
  if (typeof document === 'undefined') return '';
  try {
    const size = Math.round(R * 4);
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const ccx = size / 2;
    const ccy = size / 2;
    const cr = size / 2;

    const conic = ctx.createConicGradient(-Math.PI / 2, ccx, ccy);
    conic.addColorStop(0.0, '#ec4899'); // 0/6: family
    conic.addColorStop(0.166, '#7c3aed'); // 1/6: talent
    conic.addColorStop(0.333, '#059669'); // 2/6: organization
    conic.addColorStop(0.500, '#d97706'); // 3/6: friend
    conic.addColorStop(0.666, '#0284c7'); // 4/6: community
    conic.addColorStop(0.833, '#2563eb'); // 5/6: identity
    conic.addColorStop(1.0, '#ec4899'); // 6/6: wrap around to family

    ctx.fillStyle = conic;
    ctx.fillRect(0, 0, size, size);

    const radial = ctx.createRadialGradient(ccx, ccy, 0, ccx, ccy, cr * 0.96);
    radial.addColorStop(0.0, 'rgba(255, 255, 255, 0.98)');
    radial.addColorStop(0.18, 'rgba(255, 255, 255, 0.92)');
    radial.addColorStop(0.42, 'rgba(255, 255, 255, 0.66)');
    radial.addColorStop(0.70, 'rgba(255, 255, 255, 0.28)');
    radial.addColorStop(0.90, 'rgba(255, 255, 255, 0.06)');
    radial.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');

    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, size, size);

    return canvas.toDataURL('image/png');
  } catch (err) {
    console.error('Failed to create hexagon blend canvas', err);
    return '';
  }
}

export const LifeCapitalPillarsRadarChart: React.FC<LifeCapitalPillarsRadarChartProps> = ({
  pillars,
  selectedPillar,
  onPillarClick,
  className = '',
  style = {}
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const width = 560;
  const height = 480;
  const cx = 280;
  const cy = 245;
  const R = 142;

  const [blendImageUri, setBlendImageUri] = useState<string>(() => {
    return createHexagonConicBlend(R);
  });

  useEffect(() => {
    if (!blendImageUri) {
      const uri = createHexagonConicBlend(R);
      if (uri) setBlendImageUri(uri);
    }
  }, [R, blendImageUri]);

  // 6 angles for regular hexagon: top vertex at -90 degrees
  const angles = useMemo(() => {
    return [0, 1, 2, 3, 4, 5].map((i) => -Math.PI / 2 + (i * 2 * Math.PI) / 6);
  }, []);

  // Scale: 50.0 to 100.0
  const minScore = 55.0;
  const maxScore = 100.0;
  const getRadiusForScore = (s: number) => {
    const clamped = Math.max(minScore, Math.min(maxScore, s));
    return R * ((clamped - minScore) / (maxScore - minScore));
  };

  // Outer Regular Hexagonal Vertices
  const outerVertices = useMemo(() => {
    return angles.map((theta) => ({
      x: cx + R * Math.cos(theta),
      y: cy + R * Math.sin(theta)
    }));
  }, [cx, cy, R, angles]);

  // Outer 6-sided Hexagon SVG Path
  const outerHexagonPath = useMemo(() => {
    return (
      outerVertices
        .map((p, idx) => (idx === 0 ? `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}` : `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`))
        .join(' ') + ' Z'
    );
  }, [outerVertices]);

  // Interactive Hit Sectors for 6 Pillars
  const hitSectors = useMemo(() => {
    return PILLAR_CONFIGS.map((pillar, idx) => {
      const prevIdx = (idx + 5) % 6;
      const nextIdx = (idx + 1) % 6;
      const prevMid = {
        x: (outerVertices[prevIdx].x + outerVertices[idx].x) / 2,
        y: (outerVertices[prevIdx].y + outerVertices[idx].y) / 2
      };
      const nextMid = {
        x: (outerVertices[nextIdx].x + outerVertices[idx].x) / 2,
        y: (outerVertices[nextIdx].y + outerVertices[idx].y) / 2
      };
      const path = `M ${cx} ${cy} L ${prevMid.x.toFixed(1)} ${prevMid.y.toFixed(1)} L ${outerVertices[idx].x.toFixed(1)} ${outerVertices[idx].y.toFixed(1)} L ${nextMid.x.toFixed(1)} ${nextMid.y.toFixed(1)} Z`;
      return { pillar, idx, path };
    });
  }, [cx, cy, outerVertices]);

  // Data Points on Scored Polygon
  const dataPoints = PILLAR_CONFIGS.map((pillar, idx) => {
    const score = pillars[pillar.key] || 0;
    const r = getRadiusForScore(score);
    const theta = angles[idx];
    return {
      x: cx + r * Math.cos(theta),
      y: cy + r * Math.sin(theta),
      score,
      pillar
    };
  });

  const dataPolygonPath = dataPoints
    .map((p, idx) => (idx === 0 ? `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}` : `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`))
    .join(' ') + ' Z';

  // Grid Concentric Levels at scores: 70, 80, 90, 100
  const gridLevels = [
    { score: 70, r: getRadiusForScore(70), label: '70' },
    { score: 80, r: getRadiusForScore(80), label: '80' },
    { score: 90, r: getRadiusForScore(90), label: '90' },
    { score: 100, r: getRadiusForScore(100), label: '100' }
  ];

  return (
    <div
      className={`life-capital-radar-wrap ${className}`}
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        ...style
      }}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{
          width: '100%',
          height: 'auto',
          maxHeight: '480px',
          overflow: 'visible',
          fontFamily: 'var(--font-thai)'
        }}
      >
        <defs>
          <clipPath id="radar-hexagon-clip">
            <path d={outerHexagonPath} />
          </clipPath>

          <filter id="radar-data-shadow-life" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#4338ca" floodOpacity="0.16" />
          </filter>

          {dataPoints.map((pt, i) => {
            const nextPt = dataPoints[(i + 1) % 6];
            return (
              <linearGradient
                key={`radar-data-grad-life-${i}`}
                id={`radar-data-grad-life-${i}`}
                x1={pt.x}
                y1={pt.y}
                x2={nextPt.x}
                y2={nextPt.y}
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor={pt.pillar.darkColor} />
                <stop offset="100%" stopColor={nextPt.pillar.darkColor} />
              </linearGradient>
            );
          })}

          {outerVertices.map((v, i) => {
            const nextV = outerVertices[(i + 1) % 6];
            return (
              <linearGradient
                key={`radar-outer-grad-life-${i}`}
                id={`radar-outer-grad-life-${i}`}
                x1={v.x}
                y1={v.y}
                x2={nextV.x}
                y2={nextV.y}
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor={PILLAR_CONFIGS[i].darkColor} />
                <stop offset="100%" stopColor={PILLAR_CONFIGS[(i + 1) % 6].darkColor} />
              </linearGradient>
            );
          })}
        </defs>

        {/* 1. Hexagon Background */}
        <g className="radar-hexagon-bg" clipPath="url(#radar-hexagon-clip)">
          <path d={outerHexagonPath} fill="#ffffff" />
          {blendImageUri && (
            <image
              href={blendImageUri}
              x={cx - R}
              y={cy - R}
              width={R * 2}
              height={R * 2}
              preserveAspectRatio="none"
              style={{
                opacity: selectedPillar ? 0.38 : 0.48,
                transition: 'opacity 0.25s ease'
              }}
            />
          )}

          {hitSectors.map(({ pillar, idx, path }) => {
            const isHovered = hoveredIndex === idx;
            const isSelected = selectedPillar === pillar.key;
            return (
              <path
                key={`hit-${pillar.key}`}
                d={path}
                fill={isSelected ? 'rgba(255, 255, 255, 0.35)' : isHovered ? 'rgba(255, 255, 255, 0.22)' : 'transparent'}
                stroke={isSelected ? pillar.darkColor : isHovered ? pillar.color : 'none'}
                strokeWidth={isSelected ? 2 : isHovered ? 1.5 : 0}
                strokeDasharray={isSelected ? 'none' : isHovered ? '3 3' : 'none'}
                style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onPillarClick && onPillarClick(pillar.key)}
              />
            );
          })}
        </g>

        {/* 2. Concentric Hexagon Grid Lines */}
        <g className="radar-grid-rings">
          <path
            d={outerHexagonPath}
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="3.4"
            strokeOpacity="0.5"
            strokeLinejoin="round"
          />

          {outerVertices.map((v, i) => {
            const nextV = outerVertices[(i + 1) % 6];
            return (
              <line
                key={`outer-edge-${i}`}
                x1={v.x}
                y1={v.y}
                x2={nextV.x}
                y2={nextV.y}
                stroke={`url(#radar-outer-grad-life-${i})`}
                strokeWidth="3.4"
                strokeOpacity="0.5"
                strokeLinecap="round"
              />
            );
          })}

          {gridLevels
            .filter((lvl) => lvl.score < 100)
            .map((lvl) => {
              const ringPath = angles
                .map((theta, i) => {
                  const rx = cx + lvl.r * Math.cos(theta);
                  const ry = cy + lvl.r * Math.sin(theta);
                  return `${i === 0 ? 'M' : 'L'} ${rx.toFixed(1)} ${ry.toFixed(1)}`;
                })
                .join(' ') + ' Z';

              return (
                <path
                  key={lvl.score}
                  d={ringPath}
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              );
            })}

          {outerVertices.map((v, i) => (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={v.x.toFixed(1)}
              y2={v.y.toFixed(1)}
              stroke={PILLAR_CONFIGS[i].color}
              strokeOpacity="0.4"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
          ))}

          {gridLevels.map((lvl) => (
            <text
              key={`scale-${lvl.score}`}
              x={cx + 7}
              y={cy - lvl.r + (lvl.score === 100 ? 14 : 4)}
              fontSize="12.5px"
              fontWeight={lvl.score === 100 ? 800 : 600}
              fill={lvl.score === 100 ? '#0f172a' : '#64748b'}
              fontFamily="var(--font-latin-num)"
            >
              {lvl.label}
            </text>
          ))}
        </g>

        {/* 3. Scored Data Polygon */}
        <g className="radar-data-group">
          <path
            d={dataPolygonPath}
            fill="rgba(255, 255, 255, 0.28)"
            stroke="none"
          />

          {dataPoints.map((pt, i) => {
            const nextPt = dataPoints[(i + 1) % 6];
            const isEdgeHighlighted = hoveredIndex === i || hoveredIndex === (i + 1) % 6;
            return (
              <line
                key={`data-edge-${i}`}
                x1={pt.x}
                y1={pt.y}
                x2={nextPt.x}
                y2={nextPt.y}
                stroke={`url(#radar-data-grad-life-${i})`}
                strokeWidth={isEdgeHighlighted ? "6.2" : "5.3"}
                strokeOpacity={isEdgeHighlighted ? "0.85" : "0.5"}
                strokeLinecap="round"
                filter="url(#radar-data-shadow-life)"
                style={{ transition: 'stroke-width 0.2s ease, stroke-opacity 0.2s ease' }}
              />
            );
          })}

          {dataPoints.map((pt, i) => {
            const isHovered = hoveredIndex === i;
            return (
              <g
                key={pt.pillar.key}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onPillarClick && onPillarClick(pt.pillar.key)}
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 8.5 : 6.5}
                  fill={pt.pillar.darkColor}
                  style={{
                    transition: 'all 0.2s ease',
                    filter: isHovered
                      ? 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.35))'
                      : 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.22))'
                  }}
                />
              </g>
            );
          })}
        </g>

        {/* 4. Labels and Score Badges for 6 Pillars */}
        <g className="radar-labels-group">
          {/* Pillar 0: พลังครอบครัว (Top -90°) */}
          <g
            style={{ cursor: 'pointer' }}
            onClick={() => onPillarClick && onPillarClick('family')}
            onMouseEnter={() => setHoveredIndex(0)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <rect
              x={cx - 75}
              y={cy - R - 58}
              width={150}
              height={44}
              rx={12}
              fill={PILLAR_CONFIGS[0].pillBg}
              stroke={PILLAR_CONFIGS[0].pillBorder}
              strokeWidth={1.5}
              style={{ filter: 'drop-shadow(0 2px 6px rgba(236, 72, 153, 0.15))' }}
            />
            <text x={cx} y={cy - R - 38} textAnchor="middle" fontSize="14.5px" fontWeight={800} fill={PILLAR_CONFIGS[0].textColor}>
              {PILLAR_CONFIGS[0].name}
            </text>
            <text x={cx} y={cy - R - 21} textAnchor="middle" fontSize="13px" fontWeight={700} fill="#0f172a">
              {(pillars.family || 0).toFixed(2)}{' '}
              <tspan fontSize="10.5px" fill="#64748b" fontWeight={500}>/ 100</tspan>
            </text>
          </g>

          {/* Pillar 1: พลังสร้างปัญญา (Top-Right -30°) */}
          <g
            style={{ cursor: 'pointer' }}
            onClick={() => onPillarClick && onPillarClick('talent')}
            onMouseEnter={() => setHoveredIndex(1)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <rect
              x={outerVertices[1].x + 14}
              y={outerVertices[1].y - 32}
              width={156}
              height={44}
              rx={12}
              fill={PILLAR_CONFIGS[1].pillBg}
              stroke={PILLAR_CONFIGS[1].pillBorder}
              strokeWidth={1.5}
              style={{ filter: 'drop-shadow(0 2px 6px rgba(124, 58, 237, 0.15))' }}
            />
            <text x={outerVertices[1].x + 92} y={outerVertices[1].y - 12} textAnchor="middle" fontSize="14.5px" fontWeight={800} fill={PILLAR_CONFIGS[1].textColor}>
              {PILLAR_CONFIGS[1].name}
            </text>
            <text x={outerVertices[1].x + 92} y={outerVertices[1].y + 5} textAnchor="middle" fontSize="13px" fontWeight={700} fill="#0f172a">
              {(pillars.talent || 0).toFixed(2)}{' '}
              <tspan fontSize="10.5px" fill="#64748b" fontWeight={500}>/ 100</tspan>
            </text>
          </g>

          {/* Pillar 2: พลังที่ทำงาน (Bottom-Right +30°) */}
          <g
            style={{ cursor: 'pointer' }}
            onClick={() => onPillarClick && onPillarClick('organization')}
            onMouseEnter={() => setHoveredIndex(2)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <rect
              x={outerVertices[2].x + 14}
              y={outerVertices[2].y - 12}
              width={146}
              height={44}
              rx={12}
              fill={PILLAR_CONFIGS[2].pillBg}
              stroke={PILLAR_CONFIGS[2].pillBorder}
              strokeWidth={1.5}
              style={{ filter: 'drop-shadow(0 2px 6px rgba(5, 150, 105, 0.15))' }}
            />
            <text x={outerVertices[2].x + 87} y={outerVertices[2].y + 8} textAnchor="middle" fontSize="14.5px" fontWeight={800} fill={PILLAR_CONFIGS[2].textColor}>
              {PILLAR_CONFIGS[2].name}
            </text>
            <text x={outerVertices[2].x + 87} y={outerVertices[2].y + 25} textAnchor="middle" fontSize="13px" fontWeight={700} fill="#0f172a">
              {(pillars.organization || 0).toFixed(2)}{' '}
              <tspan fontSize="10.5px" fill="#64748b" fontWeight={500}>/ 100</tspan>
            </text>
          </g>

          {/* Pillar 3: พลังเพื่อนและกิจกรรม (Bottom +90°) */}
          <g
            style={{ cursor: 'pointer' }}
            onClick={() => onPillarClick && onPillarClick('friend')}
            onMouseEnter={() => setHoveredIndex(3)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <rect
              x={cx - 85}
              y={cy + R + 14}
              width={170}
              height={44}
              rx={12}
              fill={PILLAR_CONFIGS[3].pillBg}
              stroke={PILLAR_CONFIGS[3].pillBorder}
              strokeWidth={1.5}
              style={{ filter: 'drop-shadow(0 2px 6px rgba(217, 119, 6, 0.15))' }}
            />
            <text x={cx} y={cy + R + 34} textAnchor="middle" fontSize="14.5px" fontWeight={800} fill={PILLAR_CONFIGS[3].textColor}>
              {PILLAR_CONFIGS[3].name}
            </text>
            <text x={cx} y={cy + R + 51} textAnchor="middle" fontSize="13px" fontWeight={700} fill="#0f172a">
              {(pillars.friend || 0).toFixed(2)}{' '}
              <tspan fontSize="10.5px" fill="#64748b" fontWeight={500}>/ 100</tspan>
            </text>
          </g>

          {/* Pillar 4: พลังชุมชน (Bottom-Left +150°) */}
          <g
            style={{ cursor: 'pointer' }}
            onClick={() => onPillarClick && onPillarClick('community')}
            onMouseEnter={() => setHoveredIndex(4)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <rect
              x={outerVertices[4].x - 156}
              y={outerVertices[4].y - 12}
              width={142}
              height={44}
              rx={12}
              fill={PILLAR_CONFIGS[4].pillBg}
              stroke={PILLAR_CONFIGS[4].pillBorder}
              strokeWidth={1.5}
              style={{ filter: 'drop-shadow(0 2px 6px rgba(2, 132, 199, 0.15))' }}
            />
            <text x={outerVertices[4].x - 85} y={outerVertices[4].y + 8} textAnchor="middle" fontSize="14.5px" fontWeight={800} fill={PILLAR_CONFIGS[4].textColor}>
              {PILLAR_CONFIGS[4].name}
            </text>
            <text x={outerVertices[4].x - 85} y={outerVertices[4].y + 25} textAnchor="middle" fontSize="13px" fontWeight={700} fill="#0f172a">
              {(pillars.community || 0).toFixed(2)}{' '}
              <tspan fontSize="10.5px" fill="#64748b" fontWeight={500}>/ 100</tspan>
            </text>
          </g>

          {/* Pillar 5: พลังตัวตน (Top-Left +210° / -150°) */}
          <g
            style={{ cursor: 'pointer' }}
            onClick={() => onPillarClick && onPillarClick('identity')}
            onMouseEnter={() => setHoveredIndex(5)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <rect
              x={outerVertices[5].x - 156}
              y={outerVertices[5].y - 32}
              width={142}
              height={44}
              rx={12}
              fill={PILLAR_CONFIGS[5].pillBg}
              stroke={PILLAR_CONFIGS[5].pillBorder}
              strokeWidth={1.5}
              style={{ filter: 'drop-shadow(0 2px 6px rgba(37, 99, 235, 0.15))' }}
            />
            <text x={outerVertices[5].x - 85} y={outerVertices[5].y - 12} textAnchor="middle" fontSize="14.5px" fontWeight={800} fill={PILLAR_CONFIGS[5].textColor}>
              {PILLAR_CONFIGS[5].name}
            </text>
            <text x={outerVertices[5].x - 85} y={outerVertices[5].y + 5} textAnchor="middle" fontSize="13px" fontWeight={700} fill="#0f172a">
              {(pillars.identity || 0).toFixed(2)}{' '}
              <tspan fontSize="10.5px" fill="#64748b" fontWeight={500}>/ 100</tspan>
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
};
