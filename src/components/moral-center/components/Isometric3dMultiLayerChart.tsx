import React, { useState, useMemo, useRef, useCallback } from 'react';
import { RotateCcw } from 'lucide-react';

export interface IsometricSeriesConfig {
  key: string;
  name: string;
  icon: string;
  color: string;
}

export interface IsometricChartDataPoint {
  year: string;
  [key: string]: any;
}

interface Isometric3dMultiLayerChartProps {
  title: string;
  subtitle: string;
  data: IsometricChartDataPoint[];
  series: IsometricSeriesConfig[];
  minScore: number;
  maxScore: number;
  scoreStep?: number;
  fullScore?: number;
  scoreSuffix?: string;
}

// Opacity steps for layers in 3D: Front layer is 100%, each subsequent layer fades
const OPACITY_STEPS = [1.0, 0.85, 0.70, 0.55, 0.45, 0.35, 0.25];

export const Isometric3dMultiLayerChart: React.FC<Isometric3dMultiLayerChartProps> = ({
  title,
  subtitle,
  data,
  series,
  minScore,
  maxScore,
  scoreStep = 5,
  fullScore = 100,
  scoreSuffix = ''
}) => {
  // Mode switcher: '2d' (Two-dimensional multi-line) vs '3d' (Three-dimensional rotatable isometric)
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d');

  // คำนวณค่าเฉลี่ยคะแนน (Average Score) ของแต่ละดัชนี/พลังตลอดทุกปี
  const seriesAvgMap = useMemo(() => {
    const map = new Map<string, number>();
    series.forEach((s) => {
      const validScores = data
        .map((d) => d[s.key])
        .filter((v): v is number => typeof v === 'number');
      const avg =
        validScores.length > 0
          ? validScores.reduce((sum, val) => sum + val, 0) / validScores.length
          : 0;
      map.set(s.key, avg);
    });
    return map;
  }, [series, data]);

  // เรียงลำดับดัชนีจากค่าเฉลี่ยน้อยที่สุด (อยู่ด้านหน้า) -> ค่าเฉลี่ยมากที่สุด (อยู่ด้านหลังลึกกว่า)
  const seriesSortedByAvgAsc = useMemo(() => {
    return [...series].sort(
      (a, b) => (seriesAvgMap.get(a.key) ?? 0) - (seriesAvgMap.get(b.key) ?? 0)
    );
  }, [series, seriesAvgMap]);

  // ดัชนีที่ผู้ใช้งานคลิกเลือกให้มาอยู่ Layer หน้าสุด (null = เรียงตามค่าเฉลี่ยน้อยไปมากทั้งหมด)
  const [selectedFrontKey, setSelectedFrontKey] = useState<string | null>(null);

  // Ordered series keys:
  // - Index 0 คือ Layer หน้าสุด (ดัชนีที่ถูกเลือก หรือดัชนีที่มีค่าเฉลี่ยน้อยที่สุด)
  // - Index 1..N-1 คือ เส้น/ดัชนีที่ไม่ได้ถูกเลือกด้านหลัง โดยไล่ลำดับจากค่าเฉลี่ยน้อยอยู่ด้านหน้า -> ค่าเฉลี่ยมากกว่าอยู่ด้านหลังลึกกว่า
  const orderedKeys = useMemo(() => {
    const allAscKeys = seriesSortedByAvgAsc.map((s) => s.key);
    if (!selectedFrontKey || !allAscKeys.includes(selectedFrontKey)) {
      return allAscKeys;
    }
    const unselectedAscKeys = allAscKeys.filter((k) => k !== selectedFrontKey);
    return [selectedFrontKey, ...unselectedAscKeys];
  }, [seriesSortedByAvgAsc, selectedFrontKey]);

  // 360-degree rotation angles for 3D mode:
  // rotationYaw: ซ้าย-ขวา (-180° ถึง +180°, รวม 360° เต็มรอบ)
  // rotationPitch: ขึ้น-ลง (-90° ถึง +90°, รวม 180° ควบคุมมุมก้ม-เงย)
  const [rotationYaw, setRotationYaw] = useState<number>(0);
  const [rotationPitch, setRotationPitch] = useState<number>(0);

  // Dragging state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartXRef = useRef<number>(0);
  const dragStartYRef = useRef<number>(0);
  const dragStartYawRef = useRef<number>(0);
  const dragStartPitchRef = useRef<number>(0);

  // Active series filter for 2D mode (null means all active)
  const [highlightedKey2D, setHighlightedKey2D] = useState<string | null>(null);

  // Hover state for tooltip in 3D & 2D
  const [hoveredNode, setHoveredNode] = useState<{
    key: string;
    name: string;
    color: string;
    year: string;
    score: number;
    x: number;
    y: number;
  } | null>(null);

  // Bring selected series to front layer (index 0) in 3D while keeping unselected layers sorted by average ascending
  const handleBringToFront = (key: string) => {
    setSelectedFrontKey(key);
  };

  // Dimensions of SVG canvas
  const svgWidth = 980;
  const svgHeight = 430;
  const marginLeft = 80;
  const marginRight = 80;
  const marginTop = 55;
  const marginBottom = 70;

  const chartWidth = svgWidth - marginLeft - marginRight;
  const chartHeight = svgHeight - marginTop - marginBottom;

  const numLayers = series.length;

  // 3D 360° Orbit Rotation Mathematics:
  // rotationYaw (-180° to +180°): หมุนรอบแกนรอบตัว 360 องศา
  // rotationPitch (-90° to +90°): ควบคุมมุมก้ม-เงยในแนวตั้ง
  const yawRad = (rotationYaw * Math.PI) / 180;
  const pitchRad = (rotationPitch * Math.PI) / 180;

  const baseStepHypot = 18.5; // base depth hypotenuse
  const defaultYawAngle = Math.atan2(11, 14); // ~38.15 deg

  // Dynamic isoStepX based on 360° rotation:
  const currentYawRad = defaultYawAngle + yawRad;
  const isoStepX = Math.cos(currentYawRad) * baseStepHypot;

  // Dynamic isoStepY based on Yaw and Pitch:
  const pitchFactor = Math.cos(pitchRad);
  const pitchOffset = Math.sin(pitchRad) * 14;
  const isoStepY = Math.max(1, Math.min(28, (Math.abs(Math.sin(currentYawRad)) * baseStepHypot * pitchFactor) + pitchOffset + 4));

  const maxIsoOffsetX = Math.abs((numLayers - 1) * isoStepX);

  const years = useMemo(() => data.map((d) => d.year), [data]);

  // Adjust margin depending on whether isoStepX is tilting left or right
  const effectiveMarginLeft = isoStepX < 0 ? marginLeft + Math.abs((numLayers - 1) * isoStepX) : marginLeft;
  const effectiveChartWidth = chartWidth - maxIsoOffsetX;
  const yearStepX = effectiveChartWidth / Math.max(1, years.length - 1);

  // Series map for quick lookup
  const seriesMap = useMemo(() => {
    const map = new Map<string, IsometricSeriesConfig>();
    series.forEach((s) => map.set(s.key, s));
    return map;
  }, [series]);

  // Compute smooth cubic bezier path for an array of points
  const getSmoothCurvePath = (points: { x: number; y: number }[]): string => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
    let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return path;
  };

  // Y-axis tick values
  const yTicks = useMemo(() => {
    const ticks: number[] = [];
    for (let val = minScore; val <= maxScore + 0.001; val += scoreStep) {
      ticks.push(Number(val.toFixed(2)));
    }
    return ticks;
  }, [minScore, maxScore, scoreStep]);

  // Front baseline Y
  const frontBaselineY = svgHeight - marginBottom;

  // --------------------------------------------------------------------------------
  // Mouse & Touch Drag Handlers: 360° ซ้าย-ขวา (Yaw) & 180° ขึ้น-ลง (Pitch)
  // --------------------------------------------------------------------------------
  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    if (viewMode !== '3d') return;
    setIsDragging(true);
    dragStartXRef.current = clientX;
    dragStartYRef.current = clientY;
    dragStartYawRef.current = rotationYaw;
    dragStartPitchRef.current = rotationPitch;
  }, [viewMode, rotationYaw, rotationPitch]);

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || viewMode !== '3d') return;
    const deltaX = clientX - dragStartXRef.current;
    const deltaY = clientY - dragStartYRef.current;

    // แนวนอน (ซ้าย-ขวา): ลากหมุนได้ 360 องศาเต็ม (-180° ถึง +180°)
    const yawDelta = (deltaX / 300) * 180;
    let nextYaw = dragStartYawRef.current + yawDelta;
    // Normalize to -180 to +180 wrap-around
    while (nextYaw > 180) nextYaw -= 360;
    while (nextYaw < -180) nextYaw += 360;

    // แนวตั้ง (ขึ้น-ลง): -90° ถึง +90°
    const pitchDelta = -(deltaY / 220) * 180;
    const nextPitch = Math.max(-90, Math.min(90, dragStartPitchRef.current + pitchDelta));

    setRotationYaw(Math.round(nextYaw * 10) / 10);
    setRotationPitch(Math.round(nextPitch * 10) / 10);
  }, [isDragging, viewMode]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // --------------------------------------------------------------------------------
  // 3D LAYERS CALCULATION
  // --------------------------------------------------------------------------------
  const renderedLayers3D = useMemo(() => {
    return orderedKeys.map((key, depthIndex) => {
      const cfg = seriesMap.get(key);
      if (!cfg) return null;

      const layerIsoX = depthIndex * isoStepX;
      const layerIsoY = depthIndex * isoStepY;
      const floorY = frontBaselineY - layerIsoY;

      // Calculate coordinates for all years
      const points = data.map((d, yIdx) => {
        const score = typeof d[key] === 'number' ? d[key] : minScore;
        const scoreFraction = Math.max(0, Math.min(1, (score - minScore) / (maxScore - minScore)));
        const yScoreOffset = scoreFraction * (chartHeight - 30);
        const x = effectiveMarginLeft + yIdx * yearStepX + layerIsoX;
        const y = floorY - yScoreOffset;
        return { x, y, score, year: d.year };
      });

      const curvePath = getSmoothCurvePath(points);
      const curtainPolygonPath = `${curvePath} L ${points[points.length - 1].x.toFixed(1)} ${floorY.toFixed(1)} L ${points[0].x.toFixed(1)} ${floorY.toFixed(1)} Z`;

      const opacity = OPACITY_STEPS[depthIndex] ?? 0.25;
      const isFront = depthIndex === 0;

      return {
        key,
        name: cfg.name,
        icon: cfg.icon,
        color: cfg.color,
        depthIndex,
        isFront,
        opacity,
        floorY,
        points,
        curvePath,
        curtainPolygonPath
      };
    }).filter(Boolean);
  }, [orderedKeys, seriesMap, data, minScore, maxScore, chartHeight, frontBaselineY, effectiveMarginLeft, yearStepX, isoStepX, isoStepY]);

  // Backwards order for SVG rendering (back layers drawn first, front layer drawn last)
  const svgRenderList3D = useMemo(() => {
    return [...renderedLayers3D].reverse();
  }, [renderedLayers3D]);

  // --------------------------------------------------------------------------------
  // 2D MULTI-LINE CALCULATION
  // --------------------------------------------------------------------------------
  const renderedSeries2D = useMemo(() => {
    const baselineY2D = svgHeight - marginBottom;
    const yearStepX2D = chartWidth / Math.max(1, years.length - 1);

    return series.map((s) => {
      const isDimmed = highlightedKey2D !== null && highlightedKey2D !== s.key;
      const isSelected = highlightedKey2D === s.key;

      const points = data.map((d, yIdx) => {
        const score = typeof d[s.key] === 'number' ? d[s.key] : minScore;
        const scoreFraction = Math.max(0, Math.min(1, (score - minScore) / (maxScore - minScore)));
        const yScoreOffset = scoreFraction * (chartHeight - 20);
        const x = marginLeft + yIdx * yearStepX2D;
        const y = baselineY2D - yScoreOffset;
        return { x, y, score, year: d.year };
      });

      const curvePath = getSmoothCurvePath(points);
      const areaPath = `${curvePath} L ${points[points.length - 1].x.toFixed(1)} ${baselineY2D.toFixed(1)} L ${points[0].x.toFixed(1)} ${baselineY2D.toFixed(1)} Z`;

      return {
        key: s.key,
        name: s.name,
        icon: s.icon,
        color: s.color,
        isDimmed,
        isSelected,
        points,
        curvePath,
        areaPath
      };
    });
  }, [series, data, minScore, maxScore, chartWidth, chartHeight, marginLeft, marginBottom, years.length, highlightedKey2D]);

  return (
    <div
      className="moral-card-panel moral-bottom-dialog-3d"
      style={{
        borderRadius: '16px',
        padding: '22px 24px 20px 24px',
        marginBottom: '22px',
        userSelect: isDragging ? 'none' : 'auto'
      }}
    >
      {/* Header with Title, Mode Switcher (2D / 3D), and Rotation Controls */}
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h4 style={{ fontSize: '24.5px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
              {title}
            </h4>

            {/* View Mode Tag */}
            <span
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: viewMode === '3d' ? '#1e3a8a' : '#059669',
                backgroundColor: viewMode === '3d' ? '#e0f2fe' : '#d1fae5',
                border: viewMode === '3d' ? '1px solid #bae6fd' : '1px solid #a7f3d0',
                padding: '3px 10px',
                borderRadius: '10px'
              }}
            >
              {viewMode === '3d' ? '3D Isometric Orbit View (360° Drag)' : '2D Multi-Line Standard View'}
            </span>
          </div>
          <p style={{ fontSize: '16.5px', fontWeight: 500, color: '#475569', margin: '6px 0 0 0' }}>
            {subtitle}
          </p>
        </div>

        {/* Control Toolbar: 2D/3D Switcher & 3D 360° Orbit Reset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Segmented Control: 2D vs 3D */}
          <div
            style={{
              display: 'inline-flex',
              padding: '3px',
              backgroundColor: '#f1f5f9',
              borderRadius: '12px',
              border: '1px solid #cbd5e1'
            }}
          >
            <button
              type="button"
              onClick={() => {
                setViewMode('2d');
                setHoveredNode(null);
              }}
              style={{
                padding: '5px 14px',
                borderRadius: '9px',
                fontSize: '12px',
                fontWeight: viewMode === '2d' ? 700 : 500,
                border: 'none',
                backgroundColor: viewMode === '2d' ? '#ffffff' : 'transparent',
                color: viewMode === '2d' ? '#00247c' : '#64748b',
                boxShadow: viewMode === '2d' ? '0 2px 4px rgba(0,0,0,0.08)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.18s ease'
              }}
            >
              📊 โหมด 2 มิติ (2D)
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode('3d');
                setHoveredNode(null);
              }}
              style={{
                padding: '5px 14px',
                borderRadius: '9px',
                fontSize: '12px',
                fontWeight: viewMode === '3d' ? 700 : 500,
                border: 'none',
                backgroundColor: viewMode === '3d' ? '#1e3a8a' : 'transparent',
                color: viewMode === '3d' ? '#ffffff' : '#64748b',
                boxShadow: viewMode === '3d' ? '0 2px 6px rgba(30, 58, 138, 0.3)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.18s ease'
              }}
            >
              🧊 โหมด 3 มิติ (3D)
            </button>
          </div>

          {/* 3D 360-Degree Orbit Drag Indicator and Reset Button */}
          {viewMode === '3d' && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '10px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#475569'
                }}
                title="คลิกและลากเมาส์ (ซ้าย-ขวา 360° / ขึ้น-ลง 180°) บนกราฟเพื่อหมุนดูมุมมองอิสระ"
              >
                <span>🔄 แนวนอน: <strong>{rotationYaw >= 0 ? `+${rotationYaw.toFixed(0)}°` : `${rotationYaw.toFixed(0)}°`}</strong></span>
                <span style={{ color: '#cbd5e1' }}>|</span>
                <span>↕️ แนวตั้ง: <strong>{rotationPitch >= 0 ? `+${rotationPitch.toFixed(0)}°` : `${rotationPitch.toFixed(0)}°`}</strong></span>
                <span style={{ color: '#cbd5e1' }}>|</span>
                <span style={{ color: '#2563eb' }}>Drag ได้ 360°</span>
              </div>

              {(rotationYaw !== 0 || rotationPitch !== 0) && (
                <button
                  type="button"
                  onClick={() => {
                    setRotationYaw(0);
                    setRotationPitch(0);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '10px',
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    color: '#1d4ed8',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  title="รีเซ็ตมุมมองกลับสู่มุมมาตรฐาน (0°, 0°)"
                >
                  <RotateCcw size={12} />
                  รีเซ็ตมุม ↺
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* SVG Canvas Container with 360° Drag Handlers */}
      <div
        style={{
          width: '100%',
          position: 'relative',
          overflowX: 'auto',
          cursor: viewMode === '3d' ? (isDragging ? 'grabbing' : 'grab') : 'default'
        }}
        onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
        onMouseMove={(e) => handleDragMove(e.clientX, e.clientY)}
        onMouseUp={handleDragEnd}
        onMouseLeave={() => {
          handleDragEnd();
          setHoveredNode(null);
        }}
        onTouchStart={(e) => {
          if (e.touches[0]) handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchMove={(e) => {
          if (e.touches[0]) handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchEnd={handleDragEnd}
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: '100%', height: 'auto', display: 'block', minWidth: '760px', userSelect: 'none' }}
        >
          <defs>
            {/* Gradients for each series curtain */}
            {series.map((s) => (
              <linearGradient key={`grad-${s.key}`} id={`iso-grad-${s.key}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={s.color} stopOpacity={0.48} />
                <stop offset="60%" stopColor={s.color} stopOpacity={0.20} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0.03} />
              </linearGradient>
            ))}

            {/* Drop shadow for frontmost curve in 3D */}
            <filter id="iso-front-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="3.5" floodColor="#0f172a" floodOpacity="0.30" />
            </filter>

            {/* Subtle shadow for nodes */}
            <filter id="iso-node-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* ==========================================================
              VIEW MODE: 3D ROTATABLE ISOMETRIC MULTI-LAYER VIEW
             ========================================================== */}
          {viewMode === '3d' && (
            <>
              {/* 1. Backdrop Grid & Isometric Floor Plane */}
              <g className="iso-floor-grid">
                {/* Floor background polygon with dynamic rotatable corners */}
                <polygon
                  points={`
                    ${effectiveMarginLeft},${frontBaselineY}
                    ${effectiveMarginLeft + (numLayers - 1) * isoStepX},${frontBaselineY - (numLayers - 1) * isoStepY}
                    ${effectiveMarginLeft + (years.length - 1) * yearStepX + (numLayers - 1) * isoStepX},${frontBaselineY - (numLayers - 1) * isoStepY}
                    ${effectiveMarginLeft + (years.length - 1) * yearStepX},${frontBaselineY}
                  `}
                  fill="#f8fafc"
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />

                {/* Parallel track lines for each layer */}
                {Array.from({ length: numLayers }).map((_, dIdx) => {
                  const fY = frontBaselineY - dIdx * isoStepY;
                  const xStart = effectiveMarginLeft + dIdx * isoStepX;
                  const xEnd = effectiveMarginLeft + (years.length - 1) * yearStepX + dIdx * isoStepX;
                  return (
                    <line
                      key={`track-${dIdx}`}
                      x1={xStart}
                      y1={fY}
                      x2={xEnd}
                      y2={fY}
                      stroke={dIdx === 0 ? '#cbd5e1' : '#e2e8f0'}
                      strokeWidth={dIdx === 0 ? '1.5' : '1'}
                      strokeDasharray={dIdx === 0 ? undefined : '3 3'}
                    />
                  );
                })}

                {/* Transverse year grid lines cutting across all layers */}
                {years.map((yr, yIdx) => {
                  const xFront = effectiveMarginLeft + yIdx * yearStepX;
                  const yFront = frontBaselineY;
                  const xBack = effectiveMarginLeft + yIdx * yearStepX + (numLayers - 1) * isoStepX;
                  const yBack = frontBaselineY - (numLayers - 1) * isoStepY;
                  return (
                    <line
                      key={`year-grid-${yr}`}
                      x1={xFront}
                      y1={yFront}
                      x2={xBack}
                      y2={yBack}
                      stroke="#e2e8f0"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                  );
                })}
              </g>

              {/* 2. 3D Depth Score Grid (เส้นคะแนนในแนวลึกทะลุผ่านทุกเลเยอร์ เพื่อให้เห็นระดับคะแนนด้านหลัง) */}
              <g className="iso-depth-score-grid">
                {yTicks.map((tickVal) => {
                  const fraction = (tickVal - minScore) / (maxScore - minScore);
                  const yFrontScore = frontBaselineY - fraction * (chartHeight - 30);
                  const xBackSpine = effectiveMarginLeft - 6 + (numLayers - 1) * isoStepX;
                  const yBackScore = yFrontScore - (numLayers - 1) * isoStepY;

                  return (
                    <g key={`depth-tick-${tickVal}`}>
                      {/* เส้นเชื่อมคะแนนในแนวลึกจากหน้าไปหลังสุด (Depth Axis Line) */}
                      <line
                        x1={effectiveMarginLeft - 6}
                        y1={yFrontScore}
                        x2={xBackSpine}
                        y2={yBackScore}
                        stroke="#94a3b8"
                        strokeWidth="1.2"
                        strokeDasharray="3 3"
                        opacity={0.85}
                      />

                      {/* เส้นระนาบคะแนนแนวนอนที่เลเยอร์หลังสุด (Backmost Level Line) */}
                      <line
                        x1={xBackSpine}
                        y1={yBackScore}
                        x2={xBackSpine + (years.length - 1) * yearStepX}
                        y2={yBackScore}
                        stroke="#cbd5e1"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                        opacity={0.65}
                      />

                      {/* เส้นระนาบคะแนนตัดผ่านแต่ละเลเยอร์ตรงกลาง (Intermediate Depth Grid Lines) */}
                      {Array.from({ length: numLayers }).map((_, dIdx) => {
                        const xLayer = effectiveMarginLeft - 6 + dIdx * isoStepX;
                        const yLayer = yFrontScore - dIdx * isoStepY;
                        return (
                          <line
                            key={`score-grid-layer-${tickVal}-${dIdx}`}
                            x1={xLayer}
                            y1={yLayer}
                            x2={xLayer + (years.length - 1) * yearStepX}
                            y2={yLayer}
                            stroke="#e2e8f0"
                            strokeWidth="0.8"
                            strokeDasharray="2 4"
                            opacity={dIdx === 0 ? 0.9 : 0.45}
                          />
                        );
                      })}

                      {/* ป้ายคะแนนกำกับที่เสาหลังสุดเพื่อความสะดวกในการอ่านกราฟด้านหลัง */}
                      <text
                        x={xBackSpine - 8}
                        y={yBackScore + 3.5}
                        textAnchor="end"
                        fontSize="9.5"
                        fontWeight="600"
                        fill="#94a3b8"
                        opacity={0.8}
                      >
                        {tickVal.toFixed(fullScore <= 10 ? 1 : 0)}
                      </text>
                    </g>
                  );
                })}

                {/* เสาแกนคะแนนด้านหลังสุด (Back Depth Spine) */}
                <line
                  x1={effectiveMarginLeft - 6 + (numLayers - 1) * isoStepX}
                  y1={marginTop - 8 - (numLayers - 1) * isoStepY}
                  x2={effectiveMarginLeft - 6 + (numLayers - 1) * isoStepX}
                  y2={frontBaselineY - (numLayers - 1) * isoStepY}
                  stroke="#cbd5e1"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  opacity={0.7}
                />
              </g>

              {/* 3. Left Front Y-Axis Spine & Measurement Ticks */}
              <g className="iso-y-axis">
                <line
                  x1={effectiveMarginLeft - 6}
                  y1={marginTop - 8}
                  x2={effectiveMarginLeft - 6}
                  y2={frontBaselineY}
                  stroke="#64748b"
                  strokeWidth="1.8"
                />

                {yTicks.map((tickVal) => {
                  const fraction = (tickVal - minScore) / (maxScore - minScore);
                  const yPos = frontBaselineY - fraction * (chartHeight - 30);
                  return (
                    <g key={`ytick-${tickVal}`}>
                      <line
                        x1={effectiveMarginLeft - 10}
                        y1={yPos}
                        x2={effectiveMarginLeft - 6}
                        y2={yPos}
                        stroke="#64748b"
                        strokeWidth="1.8"
                      />
                      <text
                        x={effectiveMarginLeft - 14}
                        y={yPos + 5}
                        textAnchor="end"
                        fontSize="16.5"
                        fontWeight="700"
                        fill="#1e293b"
                      >
                        {tickVal.toFixed(fullScore <= 10 ? 1 : 0)}
                      </text>
                    </g>
                  );
                })}

                {/* Y-Axis Label */}
                <text
                  x={effectiveMarginLeft - 14}
                  y={marginTop - 15}
                  textAnchor="end"
                  fontSize="16.5"
                  fontWeight="700"
                  fill="#0f172a"
                >
                  {scoreSuffix || 'คะแนน'}
                </text>
              </g>

              {/* 4. X-Axis Year Labels along the front baseline */}
              <g className="iso-x-axis">
                {years.map((yr, yIdx) => {
                  const xPos = effectiveMarginLeft + yIdx * yearStepX;
                  return (
                    <g key={`x-lbl-${yr}`}>
                      <line
                        x1={xPos}
                        y1={frontBaselineY}
                        x2={xPos}
                        y2={frontBaselineY + 6}
                        stroke="#94a3b8"
                        strokeWidth="1.5"
                      />
                      <rect
                        x={xPos - 48}
                        y={frontBaselineY + 12}
                        width="96"
                        height="30"
                        rx="8"
                        fill="#f8fafc"
                        stroke="#cbd5e1"
                        strokeWidth="1.2"
                      />
                      <text
                        x={xPos}
                        y={frontBaselineY + 33}
                        textAnchor="middle"
                        fontSize="17"
                        fontWeight="700"
                        fill="#1e293b"
                      >
                        พ.ศ. {yr}
                      </text>
                    </g>
                  );
                })}
              </g>

              {/* 5. Layer Ribbon Walls & Curves (Rendered from Back to Front) */}
              {svgRenderList3D.map((layer) => {
                if (!layer) return null;
                const { key, name, color, isFront, opacity, points, curvePath, curtainPolygonPath } = layer;

                return (
                  <g key={`layer-3d-${key}`} style={{ transition: isDragging ? 'none' : 'opacity 0.25s ease' }}>
                    {/* Semi-transparent vertical drape/curtain under the curve */}
                    <path
                      d={curtainPolygonPath}
                      fill={`url(#iso-grad-${key})`}
                      opacity={opacity * 0.9}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleBringToFront(key)}
                    />

                    {/* Floor projection boundary line */}
                    <line
                      x1={points[0].x}
                      y1={layer.floorY}
                      x2={points[points.length - 1].x}
                      y2={layer.floorY}
                      stroke={color}
                      strokeWidth={isFront ? 1.5 : 1}
                      strokeDasharray="2 2"
                      opacity={isFront ? 0.7 : 0.35}
                    />

                    {/* Main smooth curve path */}
                    <path
                      d={curvePath}
                      fill="none"
                      stroke={color}
                      strokeWidth={isFront ? 3.5 : 2.4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity={opacity}
                      filter={isFront ? 'url(#iso-front-glow)' : undefined}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleBringToFront(key)}
                    />

                    {/* Nodes for each year */}
                    {points.map((pt) => {
                      const nodeRadius = isFront ? 5.5 : 4;
                      return (
                        <g
                          key={`node-${key}-${pt.year}`}
                          style={{ cursor: 'pointer' }}
                          onMouseEnter={() =>
                            setHoveredNode({
                              key,
                              name,
                              color,
                              year: pt.year,
                              score: pt.score,
                              x: pt.x,
                              y: pt.y
                            })
                          }
                          onMouseLeave={() => setHoveredNode(null)}
                          onClick={() => handleBringToFront(key)}
                        >
                          {/* Outer glow ring */}
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={nodeRadius + 2.5}
                            fill={color}
                            fillOpacity={isFront ? 0.35 : 0.15}
                          />
                          {/* Solid node circle */}
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={nodeRadius}
                            fill={color}
                            stroke="#ffffff"
                            strokeWidth={isFront ? 2 : 1.5}
                            filter="url(#iso-node-shadow)"
                          />
                          {/* Core highlight dot */}
                          {isFront && (
                            <circle cx={pt.x} cy={pt.y} r={1.8} fill="#ffffff" />
                          )}
                        </g>
                      );
                    })}
                  </g>
                );
              })}
            </>
          )}

          {/* ==========================================================
              VIEW MODE: 2D MULTI-LINE STANDARD VIEW
             ========================================================== */}
          {viewMode === '2d' && (
            <>
              {/* 1. Standard 2D Cartesian Grid Lines */}
              <g className="standard-2d-grid">
                {yTicks.map((tickVal) => {
                  const fraction = (tickVal - minScore) / (maxScore - minScore);
                  const yPos = (svgHeight - marginBottom) - fraction * (chartHeight - 20);
                  return (
                    <g key={`grid-2d-${tickVal}`}>
                      <line
                        x1={marginLeft}
                        y1={yPos}
                        x2={marginLeft + chartWidth}
                        y2={yPos}
                        stroke="#f1f5f9"
                        strokeWidth="1.2"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={marginLeft - 14}
                        y={yPos + 5}
                        textAnchor="end"
                        fontSize="16"
                        fontWeight="700"
                        fill="#64748b"
                      >
                        {tickVal.toFixed(fullScore <= 10 ? 1 : 0)}
                      </text>
                    </g>
                  );
                })}

                {/* Y-Axis Label */}
                <text
                  x={marginLeft - 14}
                  y={marginTop - 15}
                  textAnchor="end"
                  fontSize="16"
                  fontWeight="700"
                  fill="#334155"
                >
                  {scoreSuffix || 'คะแนน'}
                </text>

                {/* Left Y-Axis line */}
                <line
                  x1={marginLeft}
                  y1={marginTop - 8}
                  x2={marginLeft}
                  y2={svgHeight - marginBottom}
                  stroke="#cbd5e1"
                  strokeWidth="1.5"
                />

                {/* Bottom X-Axis line */}
                <line
                  x1={marginLeft}
                  y1={svgHeight - marginBottom}
                  x2={marginLeft + chartWidth}
                  y2={svgHeight - marginBottom}
                  stroke="#cbd5e1"
                  strokeWidth="1.5"
                />
              </g>

              {/* 2. X-Axis Year Labels */}
              <g className="standard-2d-x-axis">
                {years.map((yr, yIdx) => {
                  const yearStepX2D = chartWidth / Math.max(1, years.length - 1);
                  const xPos = marginLeft + yIdx * yearStepX2D;
                  const yPos = svgHeight - marginBottom;
                  return (
                    <g key={`x-lbl-2d-${yr}`}>
                      <line
                        x1={xPos}
                        y1={yPos}
                        x2={xPos}
                        y2={yPos + 6}
                        stroke="#94a3b8"
                        strokeWidth="1.5"
                      />
                      <rect
                        x={xPos - 48}
                        y={yPos + 12}
                        width="96"
                        height="30"
                        rx="8"
                        fill="#f8fafc"
                        stroke="#cbd5e1"
                        strokeWidth="1.2"
                      />
                      <text
                        x={xPos}
                        y={yPos + 33}
                        textAnchor="middle"
                        fontSize="17"
                        fontWeight="700"
                        fill="#1e293b"
                      >
                        พ.ศ. {yr}
                      </text>
                    </g>
                  );
                })}
              </g>

              {/* 3. 2D Series Curves and Markers */}
              {renderedSeries2D.map((s) => {
                const opacity = s.isDimmed ? 0.2 : (s.isSelected ? 1.0 : 0.88);
                const strokeWidth = s.isSelected ? 4 : 2.8;

                return (
                  <g key={`series-2d-${s.key}`} style={{ transition: 'all 0.2s ease' }}>
                    {/* Soft background area gradient */}
                    <path
                      d={s.areaPath}
                      fill={`url(#iso-grad-${s.key})`}
                      opacity={s.isSelected ? 0.45 : (s.isDimmed ? 0.05 : 0.15)}
                    />

                    {/* Smooth curve */}
                    <path
                      d={s.curvePath}
                      fill="none"
                      stroke={s.color}
                      strokeWidth={strokeWidth}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity={opacity}
                      filter={s.isSelected ? 'url(#iso-front-glow)' : undefined}
                    />

                    {/* Data Points */}
                    {s.points.map((pt) => {
                      return (
                        <g
                          key={`pt-2d-${s.key}-${pt.year}`}
                          style={{ cursor: 'pointer' }}
                          onMouseEnter={() =>
                            setHoveredNode({
                              key: s.key,
                              name: s.name,
                              color: s.color,
                              year: pt.year,
                              score: pt.score,
                              x: pt.x,
                              y: pt.y
                            })
                          }
                          onMouseLeave={() => setHoveredNode(null)}
                          onClick={() =>
                            setHighlightedKey2D((prev) => (prev === s.key ? null : s.key))
                          }
                        >
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={s.isSelected ? 6 : 4.5}
                            fill={s.color}
                            stroke="#ffffff"
                            strokeWidth={2}
                            filter="url(#iso-node-shadow)"
                            opacity={opacity}
                          />
                        </g>
                      );
                    })}
                  </g>
                );
              })}
            </>
          )}

          {/* ==========================================================
              HOVER TOOLTIP (SHARED ACROSS 2D & 3D)
             ========================================================== */}
          {hoveredNode && (
            <g
              transform={`translate(${hoveredNode.x}, ${Math.max(30, hoveredNode.y - 54)})`}
              style={{ pointerEvents: 'none' }}
            >
              <rect
                x="-90"
                y="-24"
                width="180"
                height="48"
                rx="10"
                fill="#0f172a"
                fillOpacity="0.94"
                stroke={hoveredNode.color}
                strokeWidth="1.8"
                filter="url(#iso-front-glow)"
              />
              <text
                x="0"
                y="-4"
                textAnchor="middle"
                fontSize="16"
                fontWeight="700"
                fill="#ffffff"
              >
                {hoveredNode.name}
              </text>
              <text
                x="0"
                y="15"
                textAnchor="middle"
                fontSize="15"
                fontWeight="600"
                fill="#94a3b8"
              >
                ปี {hoveredNode.year}: <tspan fill={hoveredNode.color} fontWeight="800">{hoveredNode.score.toFixed(2)}</tspan>
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Interactive Bottom Legend Pill Buttons */}
      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '16px', fontWeight: 600, color: '#475569' }}>
            {viewMode === '3d'
              ? 'คลิกปุ่มเพื่อดึงมิติ/พลังมาแสดงที่ Layer หน้าสุด (หรือ Drag เมาส์หมุนได้รอบทิศทาง 360°):'
              : 'คลิกปุ่มเพื่อไฮไลต์เฉพาะมิติ/พลังที่ต้องการเน้น:'}
          </span>

          {viewMode === '3d' && selectedFrontKey && selectedFrontKey !== seriesSortedByAvgAsc[0]?.key && (
            <button
              type="button"
              onClick={() => setSelectedFrontKey(null)}
              style={{
                fontSize: '13.5px',
                padding: '3px 10px',
                borderRadius: '8px',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#1d4ed8',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="รีเซ็ตให้เรียงลำดับจากดัชนีที่มีค่าเฉลี่ยน้อยที่สุดอยู่ด้านหน้า ไปหาค่าเฉลี่ยมากที่สุดอยู่ด้านหลังสุด"
            >
              เรียงตามค่าเฉลี่ย (น้อย→มาก) ↺
            </button>
          )}

          {viewMode === '2d' && highlightedKey2D && (
            <button
              type="button"
              onClick={() => setHighlightedKey2D(null)}
              style={{
                fontSize: '13.5px',
                padding: '3px 10px',
                borderRadius: '8px',
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              แสดงทุกเส้น ↺
            </button>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          {seriesSortedByAvgAsc.map((cfg) => {
            const depthIdx = orderedKeys.indexOf(cfg.key);
            const isFront = viewMode === '3d' ? depthIdx === 0 : highlightedKey2D === cfg.key;
            const isDimmed2D = viewMode === '2d' && highlightedKey2D !== null && highlightedKey2D !== cfg.key;
            const avgScore = seriesAvgMap.get(cfg.key) ?? 0;

            return (
              <button
                key={`legend-btn-${cfg.key}`}
                type="button"
                title={`${cfg.name} (ค่าเฉลี่ย 4 ปี: ${avgScore.toFixed(2)})`}
                onClick={() => {
                  if (viewMode === '3d') {
                    handleBringToFront(cfg.key);
                  } else {
                    setHighlightedKey2D((prev) => (prev === cfg.key ? null : cfg.key));
                  }
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 16px',
                  borderRadius: '18px',
                  fontSize: '16.5px',
                  fontWeight: isFront ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  border: isFront ? '1.5px solid #1e3a8a' : '1px solid #bae6fd',
                  backgroundColor: isFront ? '#1e3a8a' : '#e0f2fe',
                  color: isFront ? '#ffffff' : '#034a75',
                  opacity: isDimmed2D ? 0.45 : 1.0,
                  boxShadow: isFront ? '0 2px 8px rgba(30, 58, 138, 0.35)' : 'none'
                }}
              >
                <span
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: cfg.color,
                    border: '2px solid #ffffff'
                  }}
                />
                <span>{cfg.icon}</span>
                <span>{cfg.name}</span>

                {viewMode === '3d' && isFront && (
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 800,
                      backgroundColor: 'rgba(255, 255, 255, 0.25)',
                      color: '#ffffff',
                      marginLeft: '2px'
                    }}
                  >
                    หน้าสุด 🌟
                  </span>
                )}

                {viewMode === '3d' && !isFront && (
                  <span
                    style={{
                      fontSize: '10.5px',
                      color: '#64748b',
                      fontWeight: 600
                    }}
                  >
                    L{depthIdx + 1} ({Math.round((OPACITY_STEPS[depthIdx] ?? 0.25) * 100)}%)
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
