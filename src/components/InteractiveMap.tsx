import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import thailandMapData from '@svg-maps/thailand';
import { 
  getDistrictsForProvince, 
  getSubdistrictsForDistrict, 
  getStringHashCode,
  PROVINCE_TO_REGION,
  REGION_NAMES
} from '../utils/thaiGeography';
import { supabase } from '../lib/supabaseClient';
import { 
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer
} from 'recharts';

export type DrilldownLevel = 'country' | 'province' | 'district' | 'subdistrict';

export interface LocationData {
  province: string;
  district: string;
  subdistrict: string;
  village: string;
}

export interface OptionData {
  id: string | number;
  label: string;
}


interface InteractiveMapSVGProps {
  mapData: {
    prov: string | null;
    dist: string | null;
    sub: string | null;
    level: DrilldownLevel;
  };
  hoveredItemName: string | null;
  setHoveredItemName: (name: string | null) => void;
  tooltipPos: { x: number, y: number } | null;
  setTooltipPos: (pos: { x: number, y: number } | null) => void;
  handleCountryClick: (thName: string) => void;
  handleProvinceClick: (distName: string) => void;
  handleDistrictClick: (subName: string) => void;
  getAggregatedScore: (name: string, type: 'province' | 'district' | 'subdistrict' | 'region') => number | null;
  getScoreColor: (score: number | null) => string;
  getRegionScoreColor: (score: number | null, regionKey: string) => string;
  regionCenters: Record<string, {cx: number, cy: number}>;
  mapViewMode: 'all' | 'province' | 'region';
  checkedGeographyNodes: string[];
}

const InteractiveMapSVG: React.FC<InteractiveMapSVGProps> = (props) => {
  const {
    mapData, hoveredItemName, setHoveredItemName, tooltipPos, setTooltipPos,
    mapViewMode, checkedGeographyNodes, handleCountryClick, handleProvinceClick, handleDistrictClick,
    getAggregatedScore, getScoreColor, getRegionScoreColor,
    regionCenters
  } = props;
  
  const selectedProvince = mapData.prov;
  const selectedDistrict = mapData.dist;
  const selectedSubdistrict = mapData.sub;
  const currentLevel = mapData.level;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left + 12,
      y: e.clientY - rect.top + 12
    });
  };

  const getSelectedProvincePathD = (): string => {
    if (!selectedProvince) return '';
    const enName = provinceNamesTHtoEN[selectedProvince];
    const loc = thailandMapData.locations.find(l => l.name === enName);
    return loc ? loc.path : '';
  };

  const provincePathD = getSelectedProvincePathD();
  const districtList = getDistrictsForProvince(selectedProvince || '');
  const subdistrictList = getSubdistrictsForDistrict(selectedDistrict || '');

  const cellsToRender = currentLevel === 'province'
    ? generateGeoreferencedWavyCells(provincePathD, districtList)
    : currentLevel === 'district' || currentLevel === 'subdistrict'
      ? generateGeoreferencedWavyCells(provincePathD, subdistrictList)
      : [];

  const getActiveProvinceBounds = () => {
    if (!selectedProvince) return { w: 560 };
    const enName = provinceNamesTHtoEN[selectedProvince];
    const loc = thailandMapData.locations.find(l => l.name === enName);
    if (!loc) return { w: 560 };
    const bbox = getPathBoundingBox(loc.path);
    return {
      w: bbox.xMax - bbox.xMin
    };
  };

  const bounds = getActiveProvinceBounds();
  const zoomFactor = 560 / bounds.w;

  const getActiveViewBox = (): string => {
    if (currentLevel === 'country' || !selectedProvince) {
      return "0 0 560 1020";
    }

    const enName = provinceNamesTHtoEN[selectedProvince];
    const loc = thailandMapData.locations.find(l => l.name === enName);
    if (!loc) return "0 0 560 1020";

    const bbox = getPathBoundingBox(loc.path);
    const w = bbox.xMax - bbox.xMin;
    const h = bbox.yMax - bbox.yMin;

    if (currentLevel === 'province') {
      const padding = 0.05;
      const padX = w * padding;
      const padY = h * padding;
      return `${(bbox.xMin - padX).toFixed(1)} ${(bbox.yMin - padY).toFixed(1)} ${(w + padX * 2).toFixed(1)} ${(h + padY * 2).toFixed(1)}`;
    } else {
      const names = getDistrictsForProvince(selectedProvince);
      const c = Math.ceil(Math.sqrt(names.length));
      const r = Math.ceil(names.length / c);
      const idx = names.indexOf(selectedDistrict || '');
      if (idx !== -1) {
        const cellX = idx % c;
        const cellY = Math.floor(idx / c);
        const colWidth = w / c;
        const rowHeight = h / r;
        const distXMin = bbox.xMin + cellX * colWidth;
        const distYMin = bbox.yMin + cellY * rowHeight;
        const padding = 0.08;
        const padX = colWidth * padding;
        const padY = rowHeight * padding;
        return `${(distXMin - padX).toFixed(1)} ${(distYMin - padY).toFixed(1)} ${(colWidth + padX * 2).toFixed(1)} ${(rowHeight + padY * 2).toFixed(1)}`;
      }
      return `${bbox.xMin} ${bbox.yMin} ${w} ${h}`;
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '400px' }}>
      <svg 
        className="thailand-svg" 
          viewBox={getActiveViewBox()}
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: '100%', outline: 'none' }}
          onMouseMove={handleMouseMove}
        >
          {currentLevel !== 'country' && selectedProvince && (
            <defs>
              <clipPath id="province-clip">
                <path d={provincePathD} />
              </clipPath>
            </defs>
          )}

          {currentLevel === 'country' ? (
            <g>
              {/* Layer 1: Country Paths */}
              <g className="country-paths-layer">
                {thailandMapData.locations.map((loc) => {
                  const thName = provinceNamesENtoTH[loc.name] || loc.name;
                  const className = "map-region";
                  const regionKey = PROVINCE_TO_REGION[thName] as string;
                  const score = mapViewMode === 'region' && regionKey
                    ? getAggregatedScore(regionKey, 'region')
                    : getAggregatedScore(thName, 'province');
                  
                  const hoverName = mapViewMode === 'region' && regionKey
                    ? REGION_NAMES[regionKey as keyof typeof REGION_NAMES]
                    : thName;

                  const fill = (mapViewMode === 'region' || mapViewMode === 'all') && regionKey
                    ? getRegionScoreColor(score, regionKey)
                    : getScoreColor(score);

                  return (
                    <path
                      key={loc.id}
                      d={loc.path}
                      id={loc.id}
                      className={className}
                      onClick={() => handleCountryClick(thName)}
                      onMouseEnter={() => setHoveredItemName(hoverName)}
                      onMouseLeave={() => setHoveredItemName(null)}
                      fill={fill}
                      stroke="#ffffff"
                      strokeWidth="0.8"
                      style={{ transition: 'fill 0.3s ease' }}
                    />
                  );
                })}
              </g>
              
              {/* Layer 2: Country Score Markers */}
              <g className="country-markers-layer">
                {(() => {
                  if (mapViewMode === 'region' || mapViewMode === 'all') {
                    const regions = Object.keys(REGION_NAMES) as Array<keyof typeof REGION_NAMES>;
                    const markersToRender = [...regions].sort((a, b) => {
                      if (REGION_NAMES[a] === hoveredItemName) return 1;
                      if (REGION_NAMES[b] === hoveredItemName) return -1;
                      return 0;
                    });
                    
                    return markersToRender.map(regionKey => {
                      const thName = REGION_NAMES[regionKey];
                      const score = getAggregatedScore(regionKey, 'region');
                      const center = regionCenters[regionKey];
                      if (!center || score === null) return null;
                      
                      const isHovered = thName === hoveredItemName;
                      const scale = isHovered ? 2 : 1.3;

                      return (
                        <foreignObject key={`marker-${regionKey}`} x={center.cx - 100} y={center.cy - 100} width="200" height="100" style={{ pointerEvents: 'none', overflow: 'visible' }}>
                          <div style={{ 
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', 
                            height: '100%', transformOrigin: 'bottom center', transform: `scale(${scale})`, 
                            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)' 
                          }}>
                            <div style={{ 
                              display: 'flex', alignItems: 'center', background: 'white', borderRadius: '20px', 
                              padding: '2px 8px 2px 2px', boxShadow: isHovered ? '0 4px 12px rgba(0,0,0,0.2)' : '0 2px 6px rgba(0,0,0,0.15)', border: '1px solid #fecdd3',
                              whiteSpace: 'nowrap'
                            }}>
                              <div style={{ 
                                background: '#10b981', color: 'white', borderRadius: '10px', 
                                padding: '3px 6px', fontSize: '7px', fontWeight: 'bold', marginRight: '4px',
                                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.2)'
                              }}>
                                {thName}
                              </div>
                              <span style={{ fontSize: '9px', fontWeight: 800, color: '#334155', paddingRight: '2px' }}>
                                {score.toFixed(1)}
                              </span>
                            </div>
                            <div style={{ 
                              width: 0, height: 0, 
                              borderLeft: '5px solid transparent', borderRight: '5px solid transparent', 
                              borderTop: '7px solid white', 
                              marginTop: '-1px',
                              filter: 'drop-shadow(0 2px 1px rgba(0,0,0,0.1))'
                            }}></div>
                          </div>
                        </foreignObject>
                      );
                    });
                  } else {
                    const markersToRender = [...thailandMapData.locations].sort((a, b) => {
                      const nameA = provinceNamesENtoTH[a.name] || a.name;
                      const nameB = provinceNamesENtoTH[b.name] || b.name;
                      if (nameA === hoveredItemName) return 1;
                      if (nameB === hoveredItemName) return -1;
                      return 0;
                    });

                    return markersToRender.map((loc) => {
                      const thName = provinceNamesENtoTH[loc.name] || loc.name;
                      const score = getAggregatedScore(thName, 'province');
                      const center = getPathCenter(loc.path);

                      if (score === null) return null;

                      const isHovered = thName === hoveredItemName;
                      const scale = isHovered ? 2 : 1;

                      return (
                        <foreignObject key={`marker-${loc.id}`} x={center.cx - 100} y={center.cy - 100} width="200" height="100" style={{ pointerEvents: 'none', overflow: 'visible' }}>
                          <div style={{ 
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', 
                            height: '100%', transformOrigin: 'bottom center', transform: `scale(${scale})`, 
                            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)' 
                          }}>
                            <div style={{ 
                              display: 'flex', alignItems: 'center', background: 'white', borderRadius: '20px', 
                              padding: '2px 6px 2px 2px', boxShadow: isHovered ? '0 4px 12px rgba(0,0,0,0.2)' : '0 2px 6px rgba(0,0,0,0.15)', border: '1px solid #fecdd3',
                              whiteSpace: 'nowrap'
                            }}>
                              <div style={{ 
                                background: '#f43f5e', color: 'white', borderRadius: '10px', 
                                padding: '2.5px 5px', fontSize: '6.5px', fontWeight: 'bold', marginRight: '4px',
                                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.2)'
                              }}>
                                {thName.replace(/^จังหวัด/, '')}
                              </div>
                              <span style={{ fontSize: '8px', fontWeight: 800, color: '#334155', paddingRight: '2px' }}>
                                {score.toFixed(1)}
                              </span>
                            </div>
                            <div style={{ 
                              width: 0, height: 0, 
                              borderLeft: '4px solid transparent', borderRight: '4px solid transparent', 
                              borderTop: '6px solid white', 
                              marginTop: '-1px',
                              filter: 'drop-shadow(0 2px 1px rgba(0,0,0,0.1))'
                            }}></div>
                          </div>
                        </foreignObject>
                      );
                    });
                  }
                })()}
              </g>
            </g>
          ) : (
            <g>
              <g clipPath="url(#province-clip)">
                {/* Layer 1: District Paths */}
                <g className="district-paths-layer">
                  {cellsToRender.map((cell, idx) => {
                    const isTarget = cell.name === selectedDistrict || cell.name === selectedSubdistrict;
                    const cellStroke = isTarget ? (1.5 / zoomFactor) : (0.4 / zoomFactor);
                    const levelForScore = currentLevel === 'province' ? 'district' : 'subdistrict';
                    const score = getAggregatedScore(cell.name, levelForScore);
                    
                    // Determine if this cell is checked in the hierarchy
                    // If no children of this map's top-level are checked, we might color all.
                    // Or we just color those explicitly checked.
                    // ID format: 'dist-ProvName-DistName' or 'sub-ProvName-DistName-SubName'
                    let cellId = '';
                    if (currentLevel === 'province') {
                      cellId = `dist-${selectedProvince}-${cell.name}`;
                    } else if (currentLevel === 'district' || currentLevel === 'subdistrict') {
                      cellId = `sub-${selectedProvince}-${selectedDistrict}-${cell.name}`;
                    }
                    
                    // If there are ANY children checked inside this top-level map, we ONLY color the checked ones.
                    // Otherwise, we color all of them.
                    const anyChildChecked = checkedGeographyNodes.some(id => 
                      currentLevel === 'province' ? id.startsWith(`dist-${selectedProvince}-`) || id.startsWith(`sub-${selectedProvince}-`)
                      : id.startsWith(`sub-${selectedProvince}-${selectedDistrict}-`)
                    );
                    
                    const isCellChecked = checkedGeographyNodes.includes(cellId) || 
                                          checkedGeographyNodes.some(id => id.startsWith(cellId + '-'));

                    const shouldColor = !anyChildChecked || isCellChecked;
                    const fill = shouldColor ? getScoreColor(score) : '#f8fafc';

                    return (
                      <path
                        key={`path-${idx}`}
                        d={cell.d}
                        fill={fill}
                        onClick={() => {
                          if (currentLevel === 'province') {
                            handleProvinceClick(cell.name);
                          } else {
                            handleDistrictClick(cell.name);
                          }
                        }}
                        onMouseEnter={() => setHoveredItemName(cell.name)}
                        onMouseLeave={() => setHoveredItemName(null)}
                        stroke={isTarget ? "#0f172a" : "#ffffff"}
                        strokeWidth={cellStroke.toString()}
                        style={{ 
                          cursor: 'pointer',
                          transition: 'fill 0.3s ease',
                          filter: isTarget ? 'brightness(0.88) drop-shadow(0 2px 4px rgba(0,0,0,0.1))' : 'none'
                        }}
                      />
                    );
                  })}
                </g>

                {/* Layer 2: District Score Markers */}
                <g className="district-markers-layer">
                  {(() => {
                    const districtMarkers = [...cellsToRender].sort((a, b) => {
                      if (a.name === hoveredItemName) return 1;
                      if (b.name === hoveredItemName) return -1;
                      return 0;
                    });

                    return districtMarkers.map((cell, idx) => {
                      const levelForScore = currentLevel === 'province' ? 'district' : 'subdistrict';
                      const score = getAggregatedScore(cell.name, levelForScore);
                      const center = getPathCenter(cell.d);

                      if (score === null) return null;

                      const isHovered = cell.name === hoveredItemName;
                      const baseScale = 1 / zoomFactor;
                      const scale = isHovered ? baseScale * 2 : baseScale;

                      return (
                        <foreignObject 
                          key={`marker-${cell.name}-${idx}`}
                          x={center.cx - (100 / zoomFactor)} 
                          y={center.cy - (100 / zoomFactor)} 
                          width={200 / zoomFactor} 
                          height={100 / zoomFactor} 
                          style={{ pointerEvents: 'none', overflow: 'visible' }}
                        >
                          <div style={{ 
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', 
                            height: '100%', transform: `scale(${scale})`, transformOrigin: 'bottom center',
                            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)' 
                          }}>
                            <div style={{ 
                              display: 'flex', alignItems: 'center', background: 'white', borderRadius: '20px', 
                              padding: '2px 6px 2px 2px', boxShadow: isHovered ? '0 4px 12px rgba(0,0,0,0.2)' : '0 2px 6px rgba(0,0,0,0.15)', border: '1px solid #fecdd3',
                              whiteSpace: 'nowrap'
                            }}>
                              <div style={{ 
                                background: '#f43f5e', color: 'white', borderRadius: '10px', 
                                padding: '2.5px 5px', fontSize: '6.5px', fontWeight: 'bold', marginRight: '4px',
                                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.2)'
                              }}>
                                {cell.name.replace(/^(อำเภอ|เขต|ตำบล|แขวง)/, '')}
                              </div>
                              <span style={{ fontSize: '8px', fontWeight: 800, color: '#334155', paddingRight: '2px' }}>
                                {score.toFixed(1)}
                              </span>
                            </div>
                            <div style={{ 
                              width: 0, height: 0, 
                              borderLeft: '4px solid transparent', borderRight: '4px solid transparent', 
                              borderTop: '6px solid white', 
                              marginTop: '-1px',
                              filter: 'drop-shadow(0 2px 1px rgba(0,0,0,0.1))'
                            }}></div>
                          </div>
                        </foreignObject>
                      );
                    });
                  })()}
                </g>
              </g>
              <path 
                d={provincePathD}
                fill="none"
                stroke="#334155"
                strokeWidth={(1.2 / zoomFactor).toString()}
                style={{ pointerEvents: 'none' }}
              />
            </g>
          )}
        </svg>

        {hoveredItemName && tooltipPos && (
          <div 
            className="map-label" 
            style={{ 
              position: 'absolute', left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px`, pointerEvents: 'none',
              zIndex: 100, backgroundColor: 'rgba(15, 23, 42, 0.95)', color: 'white', border: 'none',
              padding: '5px 9px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)', animation: 'none'
            }}
          >
            {hoveredItemName}
          </div>
        )}
      </div>
  );
};


interface InteractiveMapProps {
  currentLevel: DrilldownLevel;
  setCurrentLevel: (level: DrilldownLevel) => void;
  selectedProvince: string | null;
  setSelectedProvince: (prov: string | null) => void;
  selectedDistrict: string | null;
  setSelectedDistrict: (district: string | null) => void;
  selectedSubdistrict: string | null;
  setSelectedSubdistrict: (subdistrict: string | null) => void;
  checkedGeographyNodes?: string[];
  onGeographyFilterChange?: (nodes: string[]) => void;
  onRegionChange?: (level: DrilldownLevel, name: string) => void;
  activeAgencies?: string[];
  hideProjectFilters?: boolean;
}

interface Point {
  x: number;
  y: number;
}

interface PolygonCell {
  name: string;
  d: string;
  color: string;
}

// Mathematically correct SVG path parser that calculates exact bounding box
function getPathBoundingBox(d: string): { xMin: number; yMin: number; xMax: number; yMax: number } {
  const tokens = d.match(/[a-df-z]|[+-]?(?:\d+\.\d+|\d+|\.\d+)/gi) || [];
  
  let cx = 0, cy = 0;
  let startX = 0, startY = 0;
  let xMin = Infinity, yMin = Infinity;
  let xMax = -Infinity, yMax = -Infinity;
  
  const updateBounds = (x: number, y: number) => {
    if (x < xMin) xMin = x;
    if (x > xMax) xMax = x;
    if (y < yMin) yMin = y;
    if (y > yMax) yMax = y;
  };
  
  let i = 0;
  let currentCmd = '';
  
  while (i < tokens.length) {
    const token = tokens[i];
    if (!token) { i++; continue; }
    
    if (token.match(/[a-df-z]/i)) {
      currentCmd = token;
      i++;
    }
    
    const isRelative = currentCmd === currentCmd.toLowerCase();
    const cmdUpper = currentCmd.toUpperCase();
    
    if (cmdUpper === 'M' || cmdUpper === 'L' || cmdUpper === 'T') {
      const x = parseFloat(tokens[i++]);
      const y = parseFloat(tokens[i++]);
      if (!isNaN(x) && !isNaN(y)) {
        if (isRelative) {
          cx += x;
          cy += y;
        } else {
          cx = x;
          cy = y;
        }
        updateBounds(cx, cy);
        if (cmdUpper === 'M') {
          startX = cx;
          startY = cy;
          currentCmd = isRelative ? 'l' : 'L';
        }
      }
    } else if (cmdUpper === 'H') {
      const x = parseFloat(tokens[i++]);
      if (!isNaN(x)) {
        if (isRelative) cx += x;
        else cx = x;
        updateBounds(cx, cy);
      }
    } else if (cmdUpper === 'V') {
      const y = parseFloat(tokens[i++]);
      if (!isNaN(y)) {
        if (isRelative) cy += y;
        else cy = y;
        updateBounds(cx, cy);
      }
    } else if (cmdUpper === 'C') {
      const endx = parseFloat(tokens[i + 4]);
      const endy = parseFloat(tokens[i + 5]);
      i += 6;
      
      if (!isNaN(endx) && !isNaN(endy)) {
        if (isRelative) {
          cx += endx; cy += endy;
          updateBounds(cx, cy);
        } else {
          cx = endx; cy = endy;
          updateBounds(cx, cy);
        }
      }
    } else if (cmdUpper === 'S' || cmdUpper === 'Q') {
      const endx = parseFloat(tokens[i + 2]);
      const endy = parseFloat(tokens[i + 3]);
      i += 4;
      
      if (!isNaN(endx) && !isNaN(endy)) {
        if (isRelative) {
          cx += endx; cy += endy;
          updateBounds(cx, cy);
        } else {
          cx = endx; cy = endy;
          updateBounds(cx, cy);
        }
      }
    } else if (cmdUpper === 'Z') {
      cx = startX; cy = startY;
      updateBounds(cx, cy);
    } else {
      i++;
    }
  }
  
  if (xMin === Infinity || yMin === Infinity) {
    return { xMin: 150, yMin: 350, xMax: 350, yMax: 550 };
  }
  
  return { xMin, yMin, xMax, yMax };
}

function getPathCenter(d: string): { cx: number; cy: number } {
  const bbox = getPathBoundingBox(d);
  return {
    cx: (bbox.xMin + bbox.xMax) / 2,
    cy: (bbox.yMin + bbox.yMax) / 2
  };
}

const districtPastelColors = [
  "#d9e1f2", "#e2f0d9", "#fce4d6", "#fff2cc", "#f2e5d9", 
  "#ebdcf7", "#d6f3ff", "#e2f3eb", "#ffe5ec", "#f4f5f7"
];

function generateGeoreferencedWavyCells(provincePathD: string, names: string[]): PolygonCell[] {
  const n = names.length;
  const bbox = getPathBoundingBox(provincePathD);
  const boxWidth = bbox.xMax - bbox.xMin;
  const boxHeight = bbox.yMax - bbox.yMin;

  const c = Math.ceil(Math.sqrt(n));
  const r = Math.ceil(n / c);
  
  const colWidth = boxWidth / c;
  const rowHeight = boxHeight / r;
  
  const vertices: Point[][] = [];
  const seedHash = getStringHashCode(names[0] || 'seed');

  for (let y = 0; y <= r; y++) {
    vertices[y] = [];
    for (let x = 0; x <= c; x++) {
      let px = bbox.xMin + x * colWidth;
      let py = bbox.yMin + y * rowHeight;
      
      const isBorder = x === 0 || x === c || y === 0 || y === r;
      if (!isBorder) {
        const cellHash = getStringHashCode(`${names[0]}-${x}-${y}`);
        const maxJitterX = colWidth * 0.35;
        const maxJitterY = rowHeight * 0.35;
        const dx = ((cellHash % 200) - 100) / 100 * maxJitterX;
        const dy = (((cellHash >> 4) % 200) - 100) / 100 * maxJitterY;
        px += dx;
        py += dy;
      }
      vertices[y].push({ x: px, y: py });
    }
  }
  
  const cells: PolygonCell[] = [];
  let nameIndex = 0;
  
  for (let y = 0; y < r; y++) {
    for (let x = 0; x < c; x++) {
      if (nameIndex >= n) break;
      
      const topLeft = vertices[y][x];
      const topRight = vertices[y][x + 1];
      const bottomRight = vertices[y + 1][x + 1];
      const bottomLeft = vertices[y + 1][x];
      
      const pathD = `M ${topLeft.x.toFixed(2)} ${topLeft.y.toFixed(2)} ` +
                    `L ${topRight.x.toFixed(2)} ${topRight.y.toFixed(2)} ` +
                    `L ${bottomRight.x.toFixed(2)} ${bottomRight.y.toFixed(2)} ` +
                    `L ${bottomLeft.x.toFixed(2)} ${bottomLeft.y.toFixed(2)} Z`;
      
      const label = names[nameIndex];
      let color = districtPastelColors[(seedHash + nameIndex) % districtPastelColors.length];
      
      cells.push({ name: label, d: pathD, color: color });
      nameIndex++;
    }
  }
  
  return cells;
}

const provinceNamesENtoTH: Record<string, string> = {
  "Bangkok": "กรุงเทพมหานคร", "Samut Prakan": "สมุทรปราการ", "Nonthaburi": "นนทบุรี", "Pathum Thani": "ปทุมธานี", "Phra Nakhon Si Ayutthaya": "พระนครศรีอยุธยา",
  "Ang Thong": "อ่างทอง", "Lop Buri": "ลพบุรี", "Sing Buri": "สิงห์บุรี", "Chai Nat": "ชัยนาท", "Saraburi": "สระบุรี",
  "Chon Buri": "ชลบุรี", "Rayong": "ระยอง", "Chanthaburi": "จันทบุรี", "Trat": "ตราด", "Chachoengsao": "ฉะเชิงเทรา",
  "Prachin Buri": "ปราจีนบุรี", "Nakhon Nayok": "นครนายก", "Sa Kaeo": "สระแก้ว", "Nakhon Ratchasima": "นครราชสีมา", "Buriram": "บุรีรัมย์",
  "Surin": "สุรินทร์", "Si Sa Ket": "ศรีสะเกษ", "Ubon Ratchathani": "อุบลราชธานี", "Yasothon": "ยโสธร", "Chaiyaphum": "ชัยภูมิ",
  "Amnat Charoen": "อำนาจเจริญ", "Bueng Kan": "บึงกาฬ", "Nong Bua Lam Phu": "หนองบัวลำภู", "Khon Kaen": "ขอนแก่น", "Udon Thani": "อุดรธานี",
  "Loei": "เลย", "Nong Khai": "หนองคาย", "Maha Sarakham": "มหาสารคาม", "Roi Et": "ร้อยเอ็ด", "Kalasin": "กาฬสินธุ์",
  "Sakon Nakhon": "สกลนคร", "Nakhon Phanom": "นครพนม", "Mukdahan": "มุกดาหาร", "Chiang Mai": "เชียงใหม่", "Lamphun": "ลำพูน",
  "Lampang": "ลำปาง", "Uttaradit": "อุตรดิตถ์", "Phrae": "แพร่", "Nan": "น่าน", "Phayao": "พะเยา",
  "Chiang Rai": "เชียงราย", "Mae Hong Son": "แม่ฮ่องสอน", "Nakhon Sawan": "นครสวรรค์", "Uthai Thani": "อุทัยธานี", "Kamphaeng Phet": "กำแพงเพชร",
  "Tak": "ตาก", "Sukhothai": "สุโขทัย", "Phitsanulok": "พิษณุโลก", "Phichit": "พิจิตร", "Phetchabun": "เพชรบูรณ์",
  "Ratchaburi": "ราชบุรี", "Kanchanaburi": "กาญจนบุรี", "Suphan Buri": "สุพรรณบุรี", "Nakhon Pathom": "นครปฐม", "Samut Sakhon": "สมุทรสาคร",
  "Samut Songkhram": "สมุทรสงคราม", "Phetchaburi": "เพชรบุรี", "Prachuap Khiri Khan": "ประจวบคีรีขันธ์", "Nakhon Si Thammarat": "นครศรีธรรมราช", "Krabi": "กระบี่",
  "Phangnga": "พังงา", "Phuket": "ภูเก็ต", "Surat Thani": "สุราษฎร์ธานี", "Ranong": "ระนอง", "Chumphon": "ชุมพร",
  "Songkhla": "สงขลา", "Satun": "สตูล", "Trang": "ตรัง", "Phatthalung": "พัทลุง", "Pattani": "ปัตตานี", "Yala": "ยะลา", "Narathiwat": "นราธิวาส"
};

const provinceNamesTHtoEN = Object.fromEntries(
  Object.entries(provinceNamesENtoTH).map(([en, th]) => [th, en])
);

const getScoreColor = (score: number | null): string => {
  if (score === null || isNaN(score)) return '#bfdbfe'; // Light blue (Blue 200) for no data
  
  const clamped = Math.max(0, Math.min(5, score));
  
  // If score is mostly between 3 and 5, this will map:
  // 0 -> 95%, 2.5 -> 70%, 5 -> 35%
  const lightness = 95 - (clamped / 5) * 60;
  
  return `hsl(221, 83%, ${lightness}%)`;
};

const REGION_HUES: Record<string, number> = {
  northern: 142,      // Green
  central: 221,       // Blue
  northeastern: 30,   // Orange
  eastern: 180,       // Teal
  western: 280,       // Purple
  southern: 340       // Pink
};

const getRegionScoreColor = (score: number | null, regionKey: string): string => {
  if (score === null || isNaN(score)) return '#f1f5f9';
  
  const clamped = Math.max(0, Math.min(5, score));
  const lightness = 95 - (clamped / 5) * 60;
  const hue = REGION_HUES[regionKey] || 221;
  
  return `hsl(${hue}, 75%, ${lightness}%)`;
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  currentLevel,
  setCurrentLevel,
  selectedProvince,
  setSelectedProvince,
  selectedDistrict,
  setSelectedDistrict,
  selectedSubdistrict,
  setSelectedSubdistrict,
  checkedGeographyNodes = [],
  onGeographyFilterChange,
  onRegionChange,
  activeAgencies,
  hideProjectFilters
}) => {
  const [hoveredItemName, setHoveredItemName] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const [mapViewMode, setMapViewMode] = useState<'all' | 'province' | 'region'>('province');

  // New Filter States
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [types, setTypes] = useState<OptionData[]>([]);
  const [statuses, setStatuses] = useState<OptionData[]>([]);
  const [projectsData, setProjectsData] = useState<any[]>([]);

  const [filterVirtueType, setFilterVirtueType] = useState<string>('average');
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterBudget, setFilterBudget] = useState<string>('');
  const [filterRegion, setFilterRegion] = useState<string>('');
  const [filterProvince, setFilterProvince] = useState<string>('');
  const [filterDistrict, setFilterDistrict] = useState<string>('');
  const [filterSubdistrict, setFilterSubdistrict] = useState<string>('');
  const [filterVillage, setFilterVillage] = useState<string>('');
  const [filterLocalService, setFilterLocalService] = useState<string>('');

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    fetchMapProjects();
  }, [filterType, filterStatus, filterBudget, filterRegion, filterProvince, filterDistrict, filterSubdistrict, filterVillage, filterLocalService, activeAgencies]);

  const handleMapViewModeChange = (mode: 'all' | 'province' | 'region') => {
    setMapViewMode(mode);
    if (!onGeographyFilterChange) return;

    if (mode === 'region') {
      // Auto-check all regions
      const allRegionIds = Object.keys(REGION_NAMES).map(k => `region-${k}`);
      onGeographyFilterChange(allRegionIds);
    } else if (mode === 'province') {
      // Clear region checkboxes if any exist in the current checked array
      const nonRegionIds = (checkedGeographyNodes || []).filter(k => !k.startsWith('region-'));
      onGeographyFilterChange(nonRegionIds);
    }
    // If 'all', do nothing automatically
  };

  const fetchOptions = async () => {
    const { data: locData } = await supabase.rpc('get_unique_locations');
    if (locData) setLocations(locData as LocationData[]);
    
    const { data: typeData } = await supabase.from('tor_types').select('id, type, method').order('id');
    if (typeData) setTypes(typeData.map(t => ({ id: t.id, label: `${t.type} - ${t.method}` })));
    
    const { data: statusData } = await supabase.from('tor_status').select('id, status').order('id');
    if (statusData) setStatuses(statusData.map(s => ({ id: s.id, label: s.status })));
  };

  const fetchMapProjects = async () => {
    let query = supabase.from('tor_projects').select('*, agencies(name)');
    
    if (activeAgencies && activeAgencies.length > 0) {
      query = query.in('agency_id', activeAgencies);
    }

    if (filterType) query = query.eq('type_id', filterType);
    if (filterStatus) query = query.eq('status_id', filterStatus);
    if (filterProvince) query = query.eq('province', filterProvince);
    if (filterDistrict) query = query.eq('district', filterDistrict);
    if (filterSubdistrict) query = query.eq('subdistrict', filterSubdistrict);
    if (filterVillage) query = query.eq('village', filterVillage);
    
    if (filterBudget) {
      const parts = filterBudget.split('-');
      if (parts[0] !== '0') query = query.gte('budget', parseInt(parts[0], 10));
      if (parts[1] && parts[1] !== 'null') query = query.lt('budget', parseInt(parts[1], 10));
    }

    const { data } = await query;
    if (data) {
      let filteredData = data;
      if (filterLocalService) {
        filteredData = data.filter(d => {
          const agencyName = d.agencies?.name || '';
          if (filterLocalService === 'Schools') return agencyName.includes('โรงเรียน');
          if (filterLocalService === 'University') return agencyName.includes('มหาวิทยาลัย');
          if (filterLocalService === 'Hospitals') return agencyName.includes('โรงพยาบาล');
          if (filterLocalService === 'Police') return agencyName.includes('สถานีตำรวจ');
          if (filterLocalService === 'OBJ') return agencyName.includes('องค์การบริหารส่วนจังหวัด') || agencyName.includes('อบจ');
          if (filterLocalService === 'OBT') return agencyName.includes('องค์การบริหารส่วนตำบล') || agencyName.includes('อบต');
          if (filterLocalService === 'Other') return !agencyName.includes('โรงเรียน') && !agencyName.includes('มหาวิทยาลัย') && !agencyName.includes('โรงพยาบาล') && !agencyName.includes('สถานีตำรวจ') && !agencyName.includes('องค์การบริหารส่วน');
          return true;
        });
      }
      setProjectsData(filteredData);
    }
  };

  const availableProvinces = Array.from(new Set(locations.map(l => l.province))).sort();
  const availableDistricts = filterProvince 
    ? Array.from(new Set(locations.filter(l => l.province === filterProvince).map(l => l.district))).sort() 
    : [];
  const availableSubdistricts = filterDistrict 
    ? Array.from(new Set(locations.filter(l => l.province === filterProvince && l.district === filterDistrict).map(l => l.subdistrict))).sort() 
    : [];
  const availableVillages = filterSubdistrict 
    ? Array.from(new Set(locations.filter(l => l.province === filterProvince && l.district === filterDistrict && l.subdistrict === filterSubdistrict).map(l => l.village))).sort() 
    : [];

  const handleCountryClick = (province: string) => {
    setFilterProvince(province);
    setFilterDistrict('');
    setFilterSubdistrict('');
    setFilterVillage('');
    setSelectedProvince(province);
    setCurrentLevel('province');
    setHoveredItemName(null);
    if (onRegionChange) onRegionChange('province', province);
  };

  const handleProvinceClick = (district: string) => {
    setFilterDistrict(district);
    setFilterSubdistrict('');
    setFilterVillage('');
    setSelectedDistrict(district);
    setCurrentLevel('district');
    setHoveredItemName(null);
    if (onRegionChange) onRegionChange('district', district);
  };

  const handleDistrictClick = (subdistrict: string) => {
    setFilterSubdistrict(subdistrict);
    setFilterVillage('');
    setSelectedSubdistrict(subdistrict);
    setCurrentLevel('subdistrict');
    setHoveredItemName(null);
    if (onRegionChange) onRegionChange('subdistrict', subdistrict);
  };

  const navigateToLevel = (level: DrilldownLevel) => {
    setCurrentLevel(level);
    setHoveredItemName(null);
    if (level === 'country') {
      setSelectedProvince(null);
      setSelectedDistrict(null);
      setSelectedSubdistrict(null);
      setFilterProvince('');
      setFilterDistrict('');
      setFilterSubdistrict('');
      setFilterVillage('');
    } else if (level === 'province') {
      setSelectedDistrict(null);
      setSelectedSubdistrict(null);
      setFilterDistrict('');
      setFilterSubdistrict('');
      setFilterVillage('');
    } else if (level === 'district') {
      setSelectedSubdistrict(null);
      setFilterSubdistrict('');
      setFilterVillage('');
    }
  };

  const handleRegionChangeDrilldown = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setFilterRegion(val);
    setFilterProvince('');
    setFilterDistrict('');
    setFilterSubdistrict('');
    setFilterVillage('');
    
    if (val === '') {
      navigateToLevel('country');
      if (onGeographyFilterChange) onGeographyFilterChange([]);
    } else {
      navigateToLevel('country'); // Regions don't have a drilldown map level yet, stay at country
      if (onGeographyFilterChange) onGeographyFilterChange([`reg-${val}`]);
    }
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => { 
    const val = e.target.value;
    setFilterProvince(val); 
    setFilterDistrict(''); 
    setFilterSubdistrict(''); 
    setFilterVillage(''); 
    
    // Clear region filter if a province is selected
    if (val !== '') {
      setFilterRegion('');
    }

    if (val) {
      setSelectedProvince(val);
      setCurrentLevel('province');
      if (onRegionChange) onRegionChange('province', val);
      if (onGeographyFilterChange) onGeographyFilterChange([`prov-${val}`]);
    } else {
      navigateToLevel('country');
      if (onGeographyFilterChange) {
        // If they clear province, but region was selected, we'd normally revert to region.
        // For simplicity, clearing province just clears all.
        onGeographyFilterChange([]);
        setFilterRegion('');
      }
    }
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => { 
    const val = e.target.value;
    setFilterDistrict(val); 
    setFilterSubdistrict(''); 
    setFilterVillage(''); 
    if (val) {
      setSelectedDistrict(val);
      setCurrentLevel('district');
      if (onRegionChange) onRegionChange('district', val);
    } else {
      if (filterProvince) navigateToLevel('province');
    }
  };

  const handleSubdistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => { 
    const val = e.target.value;
    setFilterSubdistrict(val); 
    setFilterVillage(''); 
    if (val) {
      setSelectedSubdistrict(val);
      setCurrentLevel('subdistrict');
      if (onRegionChange) onRegionChange('subdistrict', val);
    } else {
      if (filterDistrict) navigateToLevel('district');
    }
  };

  const getRadarDataForNode = (nodeId: string) => {
    let matchingProjects: any[] = [];
    let displayName = '';
    
    if (nodeId.startsWith('reg-')) {
      const regName = nodeId.replace('reg-', '');
      matchingProjects = projectsData.filter(p => PROVINCE_TO_REGION[p.province] === regName);
      displayName = REGION_NAMES[regName as keyof typeof REGION_NAMES] || regName;
    } else if (nodeId.startsWith('prov-')) {
      const provName = nodeId.replace('prov-', '');
      matchingProjects = projectsData.filter(p => p.province === provName);
      displayName = provName;
    } else if (nodeId.startsWith('dist-')) {
      const parts = nodeId.split('-');
      const provName = parts[1];
      const distName = parts[2];
      matchingProjects = projectsData.filter(p => p.province === provName && p.district === distName);
      displayName = distName;
    } else if (nodeId.startsWith('sub-')) {
      const parts = nodeId.split('-');
      const provName = parts[1];
      const distName = parts[2];
      const subName = parts[3];
      matchingProjects = projectsData.filter(p => p.province === provName && p.district === distName && p.subdistrict === subName);
      displayName = subName;
    }

    if (matchingProjects.length === 0) return { displayName, data: [] };

    let sumDiscipline = 0, sumSufficiency = 0, sumHonesty = 0, sumVolunteer = 0, sumGratitude = 0;
    matchingProjects.forEach(p => {
      sumDiscipline += (p.discipline || 0);
      sumSufficiency += (p.sufficiency || 0);
      sumHonesty += (p.honesty || 0);
      sumVolunteer += (p.volunteer || 0);
      sumGratitude += (p.gratitude || 0);
    });

    const count = matchingProjects.length;

    const getLevel = (score: number) => {
      if (score >= 9.0) return 'ดีเยี่ยม';
      if (score >= 7.0) return 'ระดับดี';
      if (score >= 5.0) return 'ระดับพอใช้';
      return 'ระดับน้อย';
    };

    const getScoreColorHex = (score: number) => {
      if (score >= 9.0) return '#10b981';
      if (score >= 7.0) return '#3b82f6';
      if (score >= 5.0) return '#eab308';
      return '#f43f5e';
    };

    const data = [
      { subject: 'วินัย', displayName: `วินัย ${(sumDiscipline/count).toFixed(1)}`, score: sumDiscipline/count, level: getLevel(sumDiscipline/count), color: getScoreColorHex(sumDiscipline/count) },
      { subject: 'พอเพียง', displayName: `พอเพียง ${(sumSufficiency/count).toFixed(1)}`, score: sumSufficiency/count, level: getLevel(sumSufficiency/count), color: getScoreColorHex(sumSufficiency/count) },
      { subject: 'สุจริต', displayName: `สุจริต ${(sumHonesty/count).toFixed(1)}`, score: sumHonesty/count, level: getLevel(sumHonesty/count), color: getScoreColorHex(sumHonesty/count) },
      { subject: 'จิตอาสา', displayName: `จิตอาสา ${(sumVolunteer/count).toFixed(1)}`, score: sumVolunteer/count, level: getLevel(sumVolunteer/count), color: getScoreColorHex(sumVolunteer/count) },
      { subject: 'กตัญญู', displayName: `กตัญญู ${(sumGratitude/count).toFixed(1)}`, score: sumGratitude/count, level: getLevel(sumGratitude/count), color: getScoreColorHex(sumGratitude/count) },
    ];

    return { displayName, data };
  };

  const getAggregatedScore = (regionName: string, level: 'region' | 'province' | 'district' | 'subdistrict'): number | null => {
    let matchingProjects: any[] = [];
    if (level === 'region') {
      matchingProjects = projectsData.filter(p => PROVINCE_TO_REGION[p.province] === regionName);
    } else {
      const key = level === 'province' ? 'province' : (level === 'district' ? 'district' : 'subdistrict');
      matchingProjects = projectsData.filter(p => p[key] === regionName);
    }
    if (matchingProjects.length === 0) return null;

    let sum = 0;
    matchingProjects.forEach(p => {
      if (filterVirtueType === 'average') sum += (p.calculated_average || 0);
      else if (filterVirtueType === 'discipline') sum += (p.discipline || 0);
      else if (filterVirtueType === 'sufficiency') sum += (p.sufficiency || 0);
      else if (filterVirtueType === 'honesty') sum += (p.honesty || 0);
      else if (filterVirtueType === 'volunteer') sum += (p.volunteer || 0);
      else if (filterVirtueType === 'gratitude') sum += (p.gratitude || 0);
    });
    
    return sum / matchingProjects.length;
  };

  const regionCenters = React.useMemo(() => {
    const centers: Record<string, {cx: number, cy: number}> = {};
    Object.keys(REGION_NAMES).forEach(region => {
      const provinces = Object.keys(PROVINCE_TO_REGION).filter(p => PROVINCE_TO_REGION[p] === region);
      let sumX = 0, sumY = 0, count = 0;
      provinces.forEach(pTh => {
        const pEn = provinceNamesTHtoEN[pTh];
        if (!pEn) return;
        const loc = thailandMapData.locations.find(l => l.name === pEn);
        if (loc) {
          const center = getPathCenter(loc.path);
          sumX += center.cx;
          sumY += center.cy;
          count++;
        }
      });
      if (count > 0) {
        centers[region] = { cx: sumX / count, cy: sumY / count };
      }
    });
    return centers;
  }, []);


  const mapsToRender = React.useMemo(() => {
    if (!checkedGeographyNodes || checkedGeographyNodes.length === 0) {
      return [{ prov: selectedProvince, dist: selectedDistrict, sub: selectedSubdistrict, level: currentLevel }];
    }

    // Determine top-most checked nodes
    const topMost: string[] = [];
    checkedGeographyNodes.forEach(id => {
      if (id.startsWith('region-')) return; // Ignore region nodes for map splitting (no separate region SVGs)

      if (id.startsWith('prov-')) {
        topMost.push(id);
      } else if (id.startsWith('dist-')) {
        const [, provName] = id.split('-');
        if (!checkedGeographyNodes.includes(`prov-${provName}`)) {
          topMost.push(id);
        }
      } else if (id.startsWith('sub-')) {
        const [, provName, distName] = id.split('-');
        if (!checkedGeographyNodes.includes(`prov-${provName}`) && !checkedGeographyNodes.includes(`dist-${provName}-${distName}`)) {
          topMost.push(id);
        }
      }
    });

    // Deduplicate
    const uniqueTopMost = Array.from(new Set(topMost));

    const maps = uniqueTopMost.map(nodeId => {
      const parts = nodeId.split('-');
      if (parts[0] === 'prov') {
        return { prov: parts[1], dist: null, sub: null, level: 'province' as DrilldownLevel };
      } else if (parts[0] === 'dist') {
        return { prov: parts[1], dist: parts[2], sub: null, level: 'district' as DrilldownLevel };
      } else if (parts[0] === 'sub') {
        return { prov: parts[1], dist: parts[2], sub: parts[3], level: 'subdistrict' as DrilldownLevel };
      }
      return null;
    }).filter(Boolean) as any[];

    if (maps.length > 0) {
      return maps;
    }
    
    // If no top-most nodes found (e.g. only regions are checked), fallback to current selection or country
    return [{ prov: selectedProvince, dist: selectedDistrict, sub: selectedSubdistrict, level: currentLevel }];
  }, [checkedGeographyNodes, selectedProvince, selectedDistrict, selectedSubdistrict, currentLevel]);
  return (
    <div className="map-card" style={{ overflow: 'hidden' }}>
      <div className="map-header" style={{ position: 'relative', zIndex: 10 }}>
        <div>
          <h3 className="map-title">
            {currentLevel === 'country' && 'ประเทศไทย'}
            {currentLevel === 'province' && selectedProvince}
            {currentLevel === 'district' && selectedDistrict}
            {currentLevel === 'subdistrict' && selectedSubdistrict}
          </h3>
          <div className="breadcrumbs">
            <span className="breadcrumb-item" onClick={() => navigateToLevel('country')}>ประเทศไทย</span>
            {selectedProvince && (
              <>
                <span className="breadcrumb-separator">&gt;</span>
                <span className="breadcrumb-item" onClick={() => navigateToLevel('province')}>{selectedProvince}</span>
              </>
            )}
            {selectedDistrict && (
              <>
                <span className="breadcrumb-separator">&gt;</span>
                <span className="breadcrumb-item" onClick={() => navigateToLevel('district')}>{selectedDistrict}</span>
              </>
            )}
            {selectedSubdistrict && (
              <>
                <span className="breadcrumb-separator">&gt;</span>
                <span className="breadcrumb-item">{selectedSubdistrict}</span>
              </>
            )}
          </div>
        </div>
        <button className="header-icon-btn" title="Map Settings">
          <Bell size={16} />
        </button>
      </div>

      <div className="filter-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', borderTop: '1px solid #e2e8f0' }}>
          <select value={mapViewMode} onChange={(e) => handleMapViewModeChange(e.target.value as 'all' | 'province' | 'region')} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', flex: '1 1 120px', fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>
            <option value="province">📍 ระดับจังหวัด</option>
            <option value="region">🗺️ ระดับภูมิภาค</option>
          </select>
          <select value={filterVirtueType} onChange={(e) => setFilterVirtueType(e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', flex: '1 1 150px', fontWeight: 600, color: '#3b82f6', fontSize: '13px' }}>
            <option value="average">🌟 รวมทุกด้าน (Average)</option>
            <option value="discipline">📘 วินัย</option>
            <option value="sufficiency">📗 พอเพียง</option>
            <option value="honesty">📙 สุจริต</option>
            <option value="volunteer">📕 จิตอาสา</option>
            <option value="gratitude">📒 กตัญญู</option>
          </select>
          {!hideProjectFilters && (
            <>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', flex: '1 1 120px', fontSize: '13px' }}>
                <option value="">-- All Types --</option>
                {types.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', flex: '1 1 120px', fontSize: '13px' }}>
                <option value="">-- All Statuses --</option>
                {statuses.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
              <select value={filterBudget} onChange={(e) => setFilterBudget(e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', flex: '1 1 120px', fontSize: '13px' }}>
                <option value="">-- All Budgets --</option>
                <option value="0-500000">&lt; 500,000</option>
                <option value="500000-2000000">500k - 2M</option>
                <option value="2000000-5000000">2M - 5M</option>
                <option value="5000000-10000000">5M - 10M</option>
                <option value="10000000-50000000">10M - 50M</option>
                <option value="50000000-100000000">50M - 100M</option>
                <option value="100000000-500000000">100M - 500M</option>
                <option value="500000000-1000000000">500M - 1B</option>
                <option value="1000000000-null">&gt; 1B</option>
              </select>
            </>
          )}
          <select value={filterRegion} onChange={handleRegionChangeDrilldown} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', flex: '1 1 100px', fontSize: '13px' }}>
            <option value="">-- All Regions --</option>
            {Object.entries(REGION_NAMES).map(([key, name]) => <option key={key} value={key}>{name}</option>)}
          </select>
          <select value={filterProvince} onChange={handleProvinceChange} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', flex: '1 1 100px', fontSize: '13px' }}>
            <option value="">-- All Provinces --</option>
            {availableProvinces.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filterDistrict} onChange={handleDistrictChange} disabled={!filterProvince} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', flex: '1 1 100px', fontSize: '13px' }}>
            <option value="">-- District --</option>
            {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={filterSubdistrict} onChange={handleSubdistrictChange} disabled={!filterDistrict} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', flex: '1 1 100px', fontSize: '13px' }}>
            <option value="">-- Subdistrict --</option>
            {availableSubdistricts.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterVillage} onChange={(e) => setFilterVillage(e.target.value)} disabled={!filterSubdistrict} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', flex: '1 1 100px', fontSize: '13px' }}>
            <option value="">-- Village --</option>
            {availableVillages.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <select value={filterLocalService} onChange={(e) => setFilterLocalService(e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', flex: '1 1 150px', fontWeight: 600, color: '#10b981', fontSize: '13px' }}>
            <option value="">-- Local Public Services --</option>
            <option value="Schools">🏫 Schools (โรงเรียน)</option>
            <option value="University">🎓 University (มหาวิทยาลัย)</option>
            <option value="Hospitals">🏥 Hospitals (โรงพยาบาล)</option>
            <option value="Police">🚓 Police Stations (สถานีตำรวจ)</option>
            <option value="OBJ">🏢 อบจ.</option>
            <option value="OBT">🏘️ อบต.</option>
            <option value="Other">📌 อื่นๆ (Others)</option>
          </select>
      </div>

      <div 
        className="map-container"
        style={{ cursor: 'pointer', touchAction: 'none', position: 'relative' }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${mapsToRender.length > 1 ? 2 : 1}, 1fr)`, gap: '10px', width: '100%' }}>
          {mapsToRender.map((m, idx) => (
            <div key={idx} style={{ position: 'relative', width: '100%', minHeight: '400px' }}>
              {m.prov && <div style={{position: 'absolute', top: 10, left: 10, background: 'rgba(255,255,255,0.8)', padding: '4px 8px', borderRadius: '4px', zIndex: 10, fontWeight: 'bold'}}>{m.dist || m.prov}</div>}
              <InteractiveMapSVG 
                mapData={m}
                hoveredItemName={hoveredItemName}
                setHoveredItemName={setHoveredItemName}
                tooltipPos={tooltipPos}
                setTooltipPos={setTooltipPos}
                mapViewMode={mapViewMode}
                handleCountryClick={handleCountryClick}
                handleProvinceClick={handleProvinceClick}
                handleDistrictClick={handleDistrictClick}
                getAggregatedScore={getAggregatedScore}
                getScoreColor={getScoreColor}
                getRegionScoreColor={getRegionScoreColor}
                regionCenters={regionCenters}
                checkedGeographyNodes={checkedGeographyNodes || []}
              />
            </div>
          ))}
        </div>

        {checkedGeographyNodes && checkedGeographyNodes.length > 0 && (
          <div style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            width: '100%', 
            minWidth: '400px', 
            background: 'rgba(255, 255, 255, 0.95)', 
            backdropFilter: 'blur(16px)', 
            borderRadius: '16px', 
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)', 
            border: '1px solid rgba(255, 255, 255, 0.5)',
            zIndex: 20, 
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'hidden' 
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0, 0, 0, 0.1)', background: 'rgba(255, 255, 255, 0.5)' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Chart สำหรับเปรียบเทียบคุณธรรม 5 ด้าน</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>คะแนนเฉลี่ยจากโครงการในพื้นที่ที่เลือก</p>
            </div>
            
            <div style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: checkedGeographyNodes.length > 2 ? 'repeat(3, 1fr)' : (checkedGeographyNodes.length > 1 ? 'repeat(2, 1fr)' : '1fr'), gap: '16px' }}>
                {checkedGeographyNodes.map((nodeId, idx) => {
                  const { displayName, data } = getRadarDataForNode(nodeId);
                  if (data.length === 0) return null;

                  return (
                    <div key={idx} className="chart-card" style={{ minHeight: '280px', display: 'flex', flexDirection: 'column', background: '#fff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                      <div className="chart-header" style={{ padding: '12px' }}>
                        <div className="chart-title-group">
                          <h4 className="chart-title" style={{ fontSize: '14px' }}>{displayName}</h4>
                        </div>
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '12px' }}>
                        <div style={{ width: '100%', height: '180px' }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                              <PolarGrid stroke="#e2e8f0" />
                              <PolarAngleAxis 
                                dataKey="displayName" 
                                tick={{ fill: '#0f172a', fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-thai)' }} 
                              />
                              <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                              <Radar 
                                name="คะแนนเฉลี่ย" 
                                dataKey="score" 
                                stroke="var(--color-integrity, #8b5cf6)" 
                                fill="var(--color-integrity, #8b5cf6)" 
                                fillOpacity={0.3} 
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="radar-legend-container" style={{ gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                          {data.map((item) => (
                            <div key={item.subject} className="radar-legend-item" style={{ gap: '4px' }}>
                              <span className="radar-legend-color" style={{ backgroundColor: item.color, width: '6px', height: '6px' }} />
                              <span className="radar-legend-text" style={{ fontSize: '9px' }}>{item.subject} ({item.score.toFixed(1)})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
