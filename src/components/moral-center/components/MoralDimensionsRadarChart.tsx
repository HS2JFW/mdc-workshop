import React, { useState, useEffect, useMemo } from 'react';

export interface MoralDimensionsRadarChartProps {
  dimensions: {
    gratitude: number;
    publicConsciousness: number;
    responsibility: number;
    honesty: number;
    sufficiency: number;
  };
  selectedDimension?: string | null;
  onDimensionClick?: (dimensionKey: string) => void;
  className?: string;
  style?: React.CSSProperties;
  maxScore?: number;
  minScore?: number;
}

interface DimensionConfig {
  key: 'gratitude' | 'publicConsciousness' | 'responsibility' | 'honesty' | 'sufficiency';
  name: string;
  color: string;
  darkColor: string;
  midColor: string;
  lightColor: string;
  pillBg: string;
  pillBorder: string;
  textColor: string;
}

const DIMENSION_CONFIGS: DimensionConfig[] = [
  {
    key: 'gratitude',
    name: 'กตัญญู',
    color: '#7c3aed',
    darkColor: '#6d28d9', // ขอบสีม่วงเข้ม
    midColor: '#a78bfa',
    lightColor: '#ede9fe',
    pillBg: '#f5f3ff',
    pillBorder: '#ddd6fe',
    textColor: '#5b21b6'
  },
  {
    key: 'publicConsciousness',
    name: 'จิตอาสา',
    color: '#2563eb',
    darkColor: '#1d4ed8', // ขอบสีน้ำเงินเข้ม
    midColor: '#93c5fd',
    lightColor: '#eff6ff',
    pillBg: '#eff6ff',
    pillBorder: '#bfdbfe',
    textColor: '#1e40af'
  },
  {
    key: 'responsibility',
    name: 'วินัย',
    color: '#059669',
    darkColor: '#047857', // ขอบสีเขียวเข้ม
    midColor: '#6ee7b7',
    lightColor: '#f0fdf4',
    pillBg: '#f0fdf4',
    pillBorder: '#bbf7d0',
    textColor: '#065f46'
  },
  {
    key: 'honesty',
    name: 'สุจริต',
    color: '#d97706',
    darkColor: '#c2410c', // ขอบสีส้มเข้ม
    midColor: '#fcd34d',
    lightColor: '#fff7ed',
    pillBg: '#fff7ed',
    pillBorder: '#fed7aa',
    textColor: '#9a3412'
  },
  {
    key: 'sufficiency',
    name: 'พอเพียง',
    color: '#0891b2',
    darkColor: '#0e7490', // ขอบสีฟ้าครามเข้ม
    midColor: '#67e8f9',
    lightColor: '#ecfeff',
    pillBg: '#ecfeff',
    pillBorder: '#a5f3fc',
    textColor: '#155e75'
  }
];

/**
 * สร้างภาพ Texture ไล่เฉดสี Conic + Radial Gradient แบบไร้รอยต่อ 100%
 * - เริ่มต้นจากยอดบนสุด (-90° / 12 นาฬิกา) ประจำสีม่วงกตัญญู
 * - หมุนตามเข็มนาฬิกาผ่าน น้ำเงินจิตสาธารณะ -> เขียววินัย -> ส้มสุจริต -> ฟ้าพอเพียง -> วนกลับมาม่วงกตัญญู
 * - ไล่เฉดสีขาวนวลจากจุดกึ่งกลางแผ่ออกสู่ภายนอกอย่างไร้รอยต่อ
 */
function createRadarConicBlend(R: number): string {
  if (typeof document === 'undefined') return '';
  try {
    const size = Math.round(R * 4); // 4x supersampling คมชัดระดับ Retina/4K
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const ccx = size / 2;
    const ccy = size / 2;
    const cr = size / 2;

    // 1. Conic Gradient ตามเข็มนาฬิกา เริ่มจากทิศเหนือ (-90°)
    const conic = ctx.createConicGradient(-Math.PI / 2, ccx, ccy);
    conic.addColorStop(0.0, '#7c3aed'); // 0.0: กตัญญู (ม่วง)
    conic.addColorStop(0.2, '#2563eb'); // 0.2: จิตสาธารณะ (น้ำเงิน)
    conic.addColorStop(0.4, '#059669'); // 0.4: วินัยรับผิดชอบ (เขียว)
    conic.addColorStop(0.6, '#ea580c'); // 0.6: สุจริต (ส้ม)
    conic.addColorStop(0.8, '#0891b2'); // 0.8: พอเพียง (ฟ้าคราม)
    conic.addColorStop(1.0, '#7c3aed'); // 1.0: ครบรอบเชื่อมกับสีม่วงอย่างไร้รอยต่อ

    ctx.fillStyle = conic;
    ctx.fillRect(0, 0, size, size);

    // 2. Radial Gradient: จากจุดกึ่งกลางสีขาวนวล ค่อยๆ เฟดออกสู่ขอบภายนอก
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
    console.error('Failed to create radar blend canvas', err);
    return '';
  }
}

export const MoralDimensionsRadarChart: React.FC<MoralDimensionsRadarChartProps> = ({
  dimensions,
  selectedDimension,
  onDimensionClick,
  className = '',
  style = {},
  maxScore = 6.0,
  minScore = 3.0
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // SVG Geometry
  const width = 540;
  const height = 480;
  const cx = 270;
  const cy = 245;
  const R = 142; // Outer radius

  // State เก็บ Data URL ของภาพ Blend สีไร้รอยต่อ
  const [blendImageUri, setBlendImageUri] = useState<string>(() => {
    return createRadarConicBlend(R);
  });

  useEffect(() => {
    if (!blendImageUri) {
      const uri = createRadarConicBlend(R);
      if (uri) setBlendImageUri(uri);
    }
  }, [R, blendImageUri]);

  // Angles for regular pentagon: top vertex at -90 degrees
  const angles = [-Math.PI / 2, -Math.PI / 2 + (2 * Math.PI) / 5, -Math.PI / 2 + (4 * Math.PI) / 5, -Math.PI / 2 + (6 * Math.PI) / 5, -Math.PI / 2 + (8 * Math.PI) / 5];

  // Scale: minScore (3.0) to maxScore (6.0)
  const getRadiusForScore = (s: number) => {
    const clamped = Math.max(minScore, Math.min(maxScore, s));
    return R * ((clamped - minScore) / (maxScore - minScore));
  };

  // Outer Regular Pentagonal Vertices (5 จุดยอดมุม 5 เหลี่ยมด้านเท่า)
  const outerVertices = useMemo(() => {
    return angles.map((theta) => ({
      x: cx + R * Math.cos(theta),
      y: cy + R * Math.sin(theta)
    }));
  }, [cx, cy, R, angles]);

  // Outer 5-sided Pentagon SVG Path (กรอบรูปห้าเหลี่ยมรอบนอกสมบูรณ์แบบ)
  const outerPentagonPath = useMemo(() => {
    return (
      outerVertices
        .map((p, idx) => (idx === 0 ? `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}` : `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`))
        .join(' ') + ' Z'
    );
  }, [outerVertices]);

  // Interactive Hit Test Sectors for 5 Dimensions (แบ่งโซน 5 เหลี่ยมเพื่อการ Hover/Click อย่างแม่นยำ)
  const hitSectors = useMemo(() => {
    return DIMENSION_CONFIGS.map((dim, idx) => {
      const prevIdx = (idx + 4) % 5;
      const nextIdx = (idx + 1) % 5;
      const prevMid = {
        x: (outerVertices[prevIdx].x + outerVertices[idx].x) / 2,
        y: (outerVertices[prevIdx].y + outerVertices[idx].y) / 2
      };
      const nextMid = {
        x: (outerVertices[nextIdx].x + outerVertices[idx].x) / 2,
        y: (outerVertices[nextIdx].y + outerVertices[idx].y) / 2
      };
      const path = `M ${cx} ${cy} L ${prevMid.x.toFixed(1)} ${prevMid.y.toFixed(1)} L ${outerVertices[idx].x.toFixed(1)} ${outerVertices[idx].y.toFixed(1)} L ${nextMid.x.toFixed(1)} ${nextMid.y.toFixed(1)} Z`;
      return { dim, idx, path };
    });
  }, [cx, cy, outerVertices]);

  // Data Points on Scored Polygon
  const dataPoints = DIMENSION_CONFIGS.map((dim, idx) => {
    const score = dimensions[dim.key] || 0;
    const r = getRadiusForScore(score);
    const theta = angles[idx];
    return {
      x: cx + r * Math.cos(theta),
      y: cy + r * Math.sin(theta),
      score,
      dim
    };
  });

  const dataPolygonPath = dataPoints.map((p, idx) => (idx === 0 ? `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}` : `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)).join(' ') + ' Z';

  // Grid Concentric Levels up to maxScore
  const gridLevels = useMemo(() => {
    if (maxScore > 5.0) {
      return [
        { score: 3.5, r: getRadiusForScore(3.5), label: '3.5' },
        { score: 4.0, r: getRadiusForScore(4.0), label: '4.0' },
        { score: 4.5, r: getRadiusForScore(4.5), label: '4.5' },
        { score: 5.0, r: getRadiusForScore(5.0), label: '5.0' },
        { score: 5.5, r: getRadiusForScore(5.5), label: '5.5' },
        { score: maxScore, r: getRadiusForScore(maxScore), label: maxScore.toFixed(1) }
      ];
    }
    return [
      { score: 3.5, r: getRadiusForScore(3.5), label: '3.5' },
      { score: 4.0, r: getRadiusForScore(4.0), label: '4.0' },
      { score: 4.5, r: getRadiusForScore(4.5), label: '4.5' },
      { score: maxScore, r: getRadiusForScore(maxScore), label: maxScore.toFixed(1) }
    ];
  }, [maxScore, minScore, R]);

  return (
    <div
      className={`moral-dimensions-radar-wrap ${className}`}
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
          {/* 1. ClipPath: กำหนดให้กราฟมีรูปทรงเป็น 5 เหลี่ยมของเส้นขอบนอก 100% ไม่ยื่นล้น */}
          <clipPath id="radar-pentagon-clip">
            <path d={outerPentagonPath} />
          </clipPath>

          {/* Scored Data Polygon Glow & Drop Shadow (ปรับให้จางลง 50% ตามเส้นคะแนน) */}
          <filter id="radar-data-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#1e40af" floodOpacity="0.14" />
          </filter>

          {/* Linear Gradients for Data Polygon Edges (Shaded by Corner Colors) */}
          {dataPoints.map((pt, i) => {
            const nextPt = dataPoints[(i + 1) % 5];
            return (
              <linearGradient
                key={`radar-data-grad-${i}`}
                id={`radar-data-grad-${i}`}
                x1={pt.x}
                y1={pt.y}
                x2={nextPt.x}
                y2={nextPt.y}
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor={pt.dim.darkColor} />
                <stop offset="100%" stopColor={nextPt.dim.darkColor} />
              </linearGradient>
            );
          })}

          {/* Linear Gradients for Outer Pentagon Frame Edges (Shaded by Corner Colors) */}
          {outerVertices.map((v, i) => {
            const nextV = outerVertices[(i + 1) % 5];
            return (
              <linearGradient
                key={`radar-outer-grad-${i}`}
                id={`radar-outer-grad-${i}`}
                x1={v.x}
                y1={v.y}
                x2={nextV.x}
                y2={nextV.y}
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor={DIMENSION_CONFIGS[i].darkColor} />
                <stop offset="100%" stopColor={DIMENSION_CONFIGS[(i + 1) % 5].darkColor} />
              </linearGradient>
            );
          })}
        </defs>

        {/* 1. Seamless Blended 5-sided Pentagon Background (สี blend เข้ากันอย่างไม่มีรอยต่อ) */}
        <g className="radar-pentagon-bg" clipPath="url(#radar-pentagon-clip)">
          {/* พื้นหลังขาวนวลรองพื้น */}
          <path d={outerPentagonPath} fill="#ffffff" />

          {/* ผืนสี Conic + Radial Gradient ที่ blend สีทุกมิติเข้าหากันอย่างเรียบเนียนไร้รอยต่อ */}
          {blendImageUri && (
            <image
              href={blendImageUri}
              x={cx - R}
              y={cy - R}
              width={R * 2}
              height={R * 2}
              preserveAspectRatio="none"
              style={{
                opacity: selectedDimension ? 0.38 : 0.48,
                transition: 'opacity 0.25s ease'
              }}
            />
          )}

          {/* โซน Interactive สำหรับการ Hover และคลิกเลือกมิติคุณธรรม */}
          {hitSectors.map(({ dim, idx, path }) => {
            const isHovered = hoveredIndex === idx;
            const isSelected = selectedDimension === dim.key;
            return (
              <path
                key={`hit-${dim.key}`}
                d={path}
                fill={isSelected ? 'rgba(255, 255, 255, 0.35)' : isHovered ? 'rgba(255, 255, 255, 0.22)' : 'transparent'}
                stroke={isSelected ? dim.darkColor : isHovered ? dim.color : 'none'}
                strokeWidth={isSelected ? 2 : isHovered ? 1.5 : 0}
                strokeDasharray={isSelected ? 'none' : isHovered ? '3 3' : 'none'}
                style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onDimensionClick && onDimensionClick(dim.key)}
              />
            );
          })}
        </g>

        {/* 2. Concentric Pentagon Grid Lines & Outer Pentagonal Border */}
        <g className="radar-grid-rings">
          {/* กรอบเส้นขอบนอกรูป 5 เหลี่ยมของ Graph ห้าเหลี่ยม (ปรับให้จางลง 50%: strokeOpacity 0.5) */}
          <path
            d={outerPentagonPath}
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="3.4"
            strokeOpacity="0.5"
            strokeLinejoin="round"
          />

          {/* เส้นขอบนอกรูป 5 เหลี่ยม ไล่เฉดสีตามสีของมุมทั้ง 5 (ปรับให้จางลง 50%: strokeOpacity 0.5) */}
          {outerVertices.map((v, i) => {
            const nextV = outerVertices[(i + 1) % 5];
            return (
              <line
                key={`outer-edge-${i}`}
                x1={v.x}
                y1={v.y}
                x2={nextV.x}
                y2={nextV.y}
                stroke={`url(#radar-outer-grad-${i})`}
                strokeWidth="3.4"
                strokeOpacity="0.5"
                strokeLinecap="round"
              />
            );
          })}

          {/* วง Grid ด้านในรูป 5 เหลี่ยมระดับคะแนน */}
          {gridLevels
            .filter((lvl) => lvl.score < maxScore)
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

          {/* Radial Spokes from Center to Outer Vertices (เน้นสีตามมิติมุม) */}
          {outerVertices.map((v, i) => (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={v.x.toFixed(1)}
              y2={v.y.toFixed(1)}
              stroke={DIMENSION_CONFIGS[i].color}
              strokeOpacity="0.4"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
          ))}

          {/* Grid Scale Score Markings (14px font) */}
          {gridLevels.map((lvl) => (
            <text
              key={`scale-${lvl.score}`}
              x={cx + 7}
              y={cy - lvl.r + (lvl.score >= maxScore - 0.05 ? 14 : 4)}
              fontSize="13.5px"
              fontWeight={lvl.score >= maxScore - 0.05 ? 800 : 600}
              fill={lvl.score >= maxScore - 0.05 ? '#0f172a' : '#64748b'}
              fontFamily="var(--font-latin-num)"
            >
              {lvl.label}
            </text>
          ))}
        </g>

        {/* 3. Scored Data Polygon (คะแนนจริง 5 มิติ) */}
        <g className="radar-data-group">
          {/* Scored Shape Fill */}
          <path
            d={dataPolygonPath}
            fill="rgba(255, 255, 255, 0.25)"
            stroke="none"
          />

          {/* 5 Shaded Data Line Edges ตามสีของแต่ละมุม (ปรับสีเส้นคะแนนห้าด้านให้จางลง 50%: strokeOpacity 0.5) */}
          {dataPoints.map((pt, i) => {
            const nextPt = dataPoints[(i + 1) % 5];
            const isEdgeHighlighted = hoveredIndex === i || hoveredIndex === (i + 1) % 5;
            return (
              <line
                key={`data-edge-${i}`}
                x1={pt.x}
                y1={pt.y}
                x2={nextPt.x}
                y2={nextPt.y}
                stroke={`url(#radar-data-grad-${i})`}
                strokeWidth={isEdgeHighlighted ? "6.2" : "5.3"}
                strokeOpacity={isEdgeHighlighted ? "0.85" : "0.5"}
                strokeLinecap="round"
                filter="url(#radar-data-shadow)"
                style={{ transition: 'stroke-width 0.2s ease, stroke-opacity 0.2s ease' }}
              />
            );
          })}

          {/* Vertex Data Dots (จุดคะแนนเป็นวงกลมทึบตามสีของแต่ละมิติ) */}
          {dataPoints.map((pt, i) => {
            const isHovered = hoveredIndex === i;
            return (
              <g
                key={pt.dim.key}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onDimensionClick && onDimensionClick(pt.dim.key)}
              >
                {/* จุดคะแนนวงกลมทึบตามสีของมิติคุณธรรม */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 8.5 : 6.5}
                  fill={pt.dim.darkColor}
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

        {/* 4. Labels and Score Badges for 5 Dimensions (+50% Larger Font Size) */}
        <g className="radar-labels-group">
          {/* Dimension 0: กตัญญู (Top) */}
          <g
            style={{ cursor: 'pointer' }}
            onClick={() => onDimensionClick && onDimensionClick('gratitude')}
            onMouseEnter={() => setHoveredIndex(0)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <text
              x="270"
              y="32"
              textAnchor="middle"
              fill={DIMENSION_CONFIGS[0].darkColor}
              fontSize="18px"
              fontWeight="800"
            >
              กตัญญู
            </text>
            <g transform="translate(225, 40)">
              <rect
                width="90"
                height="30"
                rx="15"
                fill={DIMENSION_CONFIGS[0].pillBg}
                stroke={DIMENSION_CONFIGS[0].pillBorder}
                strokeWidth="1.8"
              />
              <text
                x="45"
                y="21"
                textAnchor="middle"
                fill={DIMENSION_CONFIGS[0].textColor}
                fontSize="20px"
                fontWeight="900"
                fontFamily="var(--font-latin-num)"
              >
                {dimensions.gratitude.toFixed(2)}
              </text>
            </g>
            <text
              x="270"
              y="86"
              textAnchor="middle"
              fill="#64748b"
              fontSize="13.5px"
              fontWeight="600"
              fontFamily="var(--font-latin-num)"
            >
              / {maxScore.toFixed(1)} ({(dimensions.gratitude / maxScore * 100).toFixed(1)}%)
            </text>
          </g>

          {/* Dimension 1: จิตสาธารณะ (Top-Right) */}
          <g
            style={{ cursor: 'pointer' }}
            onClick={() => onDimensionClick && onDimensionClick('publicConsciousness')}
            onMouseEnter={() => setHoveredIndex(1)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <text
              x="422"
              y="178"
              textAnchor="start"
              fill={DIMENSION_CONFIGS[1].darkColor}
              fontSize="18px"
              fontWeight="800"
            >
              จิตอาสา
            </text>
            <g transform="translate(422, 188)">
              <rect
                width="88"
                height="30"
                rx="15"
                fill={DIMENSION_CONFIGS[1].pillBg}
                stroke={DIMENSION_CONFIGS[1].pillBorder}
                strokeWidth="1.8"
              />
              <text
                x="44"
                y="21"
                textAnchor="middle"
                fill={DIMENSION_CONFIGS[1].textColor}
                fontSize="20px"
                fontWeight="900"
                fontFamily="var(--font-latin-num)"
              >
                {dimensions.publicConsciousness.toFixed(2)}
              </text>
            </g>
            <text
              x="422"
              y="234"
              textAnchor="start"
              fill="#64748b"
              fontSize="13.5px"
              fontWeight="600"
              fontFamily="var(--font-latin-num)"
            >
              / {maxScore.toFixed(1)} ({(dimensions.publicConsciousness / maxScore * 100).toFixed(1)}%)
            </text>
          </g>

          {/* Dimension 2: วินัย (Bottom-Right) */}
          <g
            style={{ cursor: 'pointer' }}
            onClick={() => onDimensionClick && onDimensionClick('responsibility')}
            onMouseEnter={() => setHoveredIndex(2)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <text
              x="368"
              y="384"
              textAnchor="start"
              fill={DIMENSION_CONFIGS[2].darkColor}
              fontSize="18px"
              fontWeight="800"
            >
              วินัย
            </text>
            <g transform="translate(368, 394)">
              <rect
                width="88"
                height="30"
                rx="15"
                fill={DIMENSION_CONFIGS[2].pillBg}
                stroke={DIMENSION_CONFIGS[2].pillBorder}
                strokeWidth="1.8"
              />
              <text
                x="44"
                y="21"
                textAnchor="middle"
                fill={DIMENSION_CONFIGS[2].textColor}
                fontSize="20px"
                fontWeight="900"
                fontFamily="var(--font-latin-num)"
              >
                {dimensions.responsibility.toFixed(2)}
              </text>
            </g>
            <text
              x="368"
              y="440"
              textAnchor="start"
              fill="#64748b"
              fontSize="13.5px"
              fontWeight="600"
              fontFamily="var(--font-latin-num)"
            >
              / {maxScore.toFixed(1)} ({(dimensions.responsibility / maxScore * 100).toFixed(1)}%)
            </text>
          </g>

          {/* Dimension 3: สุจริต (Bottom-Left) */}
          <g
            style={{ cursor: 'pointer' }}
            onClick={() => onDimensionClick && onDimensionClick('honesty')}
            onMouseEnter={() => setHoveredIndex(3)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <text
              x="172"
              y="384"
              textAnchor="end"
              fill={DIMENSION_CONFIGS[3].darkColor}
              fontSize="18px"
              fontWeight="800"
            >
              สุจริต
            </text>
            <g transform="translate(84, 394)">
              <rect
                width="88"
                height="30"
                rx="15"
                fill={DIMENSION_CONFIGS[3].pillBg}
                stroke={DIMENSION_CONFIGS[3].pillBorder}
                strokeWidth="1.8"
              />
              <text
                x="44"
                y="21"
                textAnchor="middle"
                fill={DIMENSION_CONFIGS[3].textColor}
                fontSize="20px"
                fontWeight="900"
                fontFamily="var(--font-latin-num)"
              >
                {dimensions.honesty.toFixed(2)}
              </text>
            </g>
            <text
              x="172"
              y="440"
              textAnchor="end"
              fill="#64748b"
              fontSize="13.5px"
              fontWeight="600"
              fontFamily="var(--font-latin-num)"
            >
              / {maxScore.toFixed(1)} ({(dimensions.honesty / maxScore * 100).toFixed(1)}%)
            </text>
          </g>

          {/* Dimension 4: พอเพียง (Top-Left) */}
          <g
            style={{ cursor: 'pointer' }}
            onClick={() => onDimensionClick && onDimensionClick('sufficiency')}
            onMouseEnter={() => setHoveredIndex(4)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <text
              x="118"
              y="178"
              textAnchor="end"
              fill={DIMENSION_CONFIGS[4].darkColor}
              fontSize="18px"
              fontWeight="800"
            >
              พอเพียง
            </text>
            <g transform="translate(30, 188)">
              <rect
                width="88"
                height="30"
                rx="15"
                fill={DIMENSION_CONFIGS[4].pillBg}
                stroke={DIMENSION_CONFIGS[4].pillBorder}
                strokeWidth="1.8"
              />
              <text
                x="44"
                y="21"
                textAnchor="middle"
                fill={DIMENSION_CONFIGS[4].textColor}
                fontSize="20px"
                fontWeight="900"
                fontFamily="var(--font-latin-num)"
              >
                {dimensions.sufficiency.toFixed(2)}
              </text>
            </g>
            <text
              x="118"
              y="234"
              textAnchor="end"
              fill="#64748b"
              fontSize="13.5px"
              fontWeight="600"
              fontFamily="var(--font-latin-num)"
            >
              / {maxScore.toFixed(1)} ({(dimensions.sufficiency / maxScore * 100).toFixed(1)}%)
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
};
