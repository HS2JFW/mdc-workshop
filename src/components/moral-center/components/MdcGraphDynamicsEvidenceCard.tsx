import React from 'react';
import {
  TrendingUp,
  BarChart3,
  Activity,
  ArrowRight,
  MapPin,
  HelpCircle,
  AlertTriangle,
  Compass,
  Layers
} from 'lucide-react';
import type { GraphDynamicsEvidence } from '../data/graphDynamicsEvidenceData';

export interface MdcGraphDynamicsEvidenceCardProps {
  evidence: GraphDynamicsEvidence;
  accentColor?: string;
  topicName?: string;
}

export const MdcGraphDynamicsEvidenceCard: React.FC<MdcGraphDynamicsEvidenceCardProps> = ({
  evidence,
  accentColor = '#2563eb',
  topicName
}) => {
  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '24px',
        border: '1.5px solid #cbd5e1',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        fontFamily: "'Kanit', sans-serif"
      }}
    >
      {/* 1. Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: `linear-gradient(135deg, ${accentColor}, #0284c7)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
          >
            <Activity size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12.5px', fontWeight: 800, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              🔎 ถอดรหัสการเคลื่อนไหวของกราฟสู่ผลลัพธ์เชิงประจักษ์ (Visual Graph Dynamics)
            </div>
            <h3 style={{ fontSize: '19px', fontWeight: 800, margin: '2px 0 0 0', color: '#0f172a' }}>
              ที่มาของตัวเลข {evidence.multiplierText} ได้มาอย่างไรจากข้อมูลกราฟ?
            </h3>
          </div>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '20px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            fontSize: '13.5px',
            fontWeight: 800
          }}
        >
          <TrendingUp size={16} />
          <span>อัตราผลกระทบ: {evidence.multiplierText}</span>
        </div>
      </div>

      {/* 2. Highlight Derivation Box (สูตรและที่มาของการคำนวณจากเส้นกราฟ) */}
      <div
        style={{
          background: '#f8fafc',
          borderLeft: `5px solid ${accentColor}`,
          borderRadius: '12px',
          padding: '16px 20px',
          border: '1.5px solid #e2e8f0',
          borderLeftWidth: '5px'
        }}
      >
        <div style={{ fontSize: '13px', fontWeight: 800, color: '#475569', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <HelpCircle size={16} color={accentColor} />
          <span>กราฟส่วนไหนเป็นตัวบอก และคำนวณตัวเลขนี้อย่างไร?</span>
        </div>
        <div style={{ fontSize: '15px', color: '#1e293b', lineHeight: 1.6, fontWeight: 500 }}>
          {evidence.multiplierDerivation}
        </div>
      </div>

      {/* 3. Three-Column Graph Breakdown Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px'
        }}
      >
        {/* Card 1: Low Bar Observation */}
        <div
          style={{
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '16px 18px',
            border: '1.5px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0369a1', fontWeight: 800, fontSize: '14.5px' }}>
            <BarChart3 size={18} />
            <span>1. แถว/แท่งกราฟส่วนที่ลดต่ำลง (Low Bar)</span>
          </div>
          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
            {evidence.lowBarObservation.barName}
          </div>
          <div style={{ fontSize: '13px', color: '#475569' }}>
            <strong>พื้นที่ที่แท่งกราฟเตี้ย:</strong> {evidence.lowBarObservation.regions}
          </div>
          <div style={{ fontSize: '13px', color: '#334155', lineHeight: 1.5, background: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            {evidence.lowBarObservation.phenomenon}
          </div>
        </div>

        {/* Card 2: High Line Observation */}
        <div
          style={{
            background: '#fef2f2',
            borderRadius: '12px',
            padding: '16px 18px',
            border: '1.5px solid #fecaca',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626', fontWeight: 800, fontSize: '14.5px' }}>
            <TrendingUp size={18} />
            <span>2. เส้นกราฟส่วนที่พุ่งสูงชัน (High Line)</span>
          </div>
          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#7f1d1d' }}>
            {evidence.highLineObservation.lineName}
          </div>
          <div style={{ fontSize: '13px', color: '#991b1b' }}>
            <strong>จุดพีคสูงสุดบนเส้น:</strong> <span style={{ fontSize: '15px', fontWeight: 900, color: '#b91c1c' }}>{evidence.highLineObservation.peakValue}</span>
          </div>
          <div style={{ fontSize: '13px', color: '#450a0a', lineHeight: 1.5, background: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #fca5a5' }}>
            {evidence.highLineObservation.phenomenon}
          </div>
        </div>

        {/* Card 3: Movement Dynamics */}
        <div
          style={{
            background: '#eff6ff',
            borderRadius: '12px',
            padding: '16px 18px',
            border: '1.5px solid #bfdbfe',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1d4ed8', fontWeight: 800, fontSize: '14.5px' }}>
            <Layers size={18} />
            <span>3. การเคลื่อนไหวของกราฟ (Movement Dynamics)</span>
          </div>
          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e3a8a' }}>
            {evidence.graphMovementDynamics.patternName}
          </div>
          <div style={{ fontSize: '13px', color: '#172554', lineHeight: 1.5, background: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #93c5fd' }}>
            {evidence.graphMovementDynamics.description}
          </div>
        </div>
      </div>

      {/* 4. Chart 2 (Bubble Matrix 77 Provinces) Spatial Confirmation */}
      <div
        style={{
          background: '#f0fdf4',
          borderRadius: '12px',
          padding: '14px 18px',
          border: '1.5px solid #bbf7d0',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}
      >
        <div
          style={{
            minWidth: '32px',
            height: '32px',
            borderRadius: '8px',
            background: '#16a34a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '2px'
          }}
        >
          <Compass size={19} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#14532d' }}>
            การยืนยันในกราฟที่ 2 (พิกัดฟองความสัมพันธ์เชิงพื้นที่ 77 จังหวัด): {evidence.bubbleMatrixObservation.quadrant}
          </div>
          <div style={{ fontSize: '13.5px', color: '#166534', lineHeight: 1.5 }}>
            {evidence.bubbleMatrixObservation.clusterDetails}
          </div>
          <div style={{ fontSize: '12.5px', color: '#15803d', marginTop: '2px' }}>
            <strong>กลุ่มจังหวัดขับเคลื่อนสำคัญ:</strong> {evidence.bubbleMatrixObservation.keyProvinces}
          </div>
        </div>
      </div>
    </div>
  );
};
