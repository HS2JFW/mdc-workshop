import React from 'react';
import { MdcTopSearchBar } from '../components/MdcTopSearchBar';
import './PolicyMoralAnalysisDashboardView.css';

export interface PolicyMoralAnalysisDashboardViewProps {
  onNavigatePage: (pageId: string) => void;
  onExportPdf?: () => void | Promise<void>;
}

export const PolicyMoralAnalysisDashboardView: React.FC<PolicyMoralAnalysisDashboardViewProps> = ({
  onNavigatePage,
  onExportPdf
}) => {
  const [hoveredPillar, setHoveredPillar] = React.useState<string | null>(null);

  return (
    <div className="mdc-baworn-analysis-wrapper">
      {/* 1. แถบเมนูด้านบน (เปลี่ยนภาษา, Export PDF, เข้าสู่ระบบ อยู่ด้านขวาสุด) */}
      <MdcTopSearchBar
        onExportPdf={onExportPdf}
        defaultTitle="พลังแห่ง ‘บวร’ สร้างชุมชนยั่งยืน"
        defaultSubtitle="ศูนย์ข้อมูลสารสนเทศด้านคุณธรรม (Moral Data Center)"
      />

      {/* 2. พื้นที่แสดงผลกราฟิก (ภาพ Background ตรงตามแบบที่ส่งให้ + ปุ่มและกล่องข้อความเป็น CSS) */}
      <div className="mdc-baworn-canvas-container">
        <div className="mdc-baworn-stage">
          {/* A. รูปภาพ Background 3 มิติ (ตรงตามแบบที่ผู้ใช้ส่งให้ทุกประการ) */}
          <img
            src="/theme/baworn_pure_art_background.png"
            alt="พลังแห่ง ‘บวร’ สร้างชุมชนยั่งยืน"
            className="mdc-baworn-bg-art"
            draggable={false}
          />

          {/* B. โซนคลิกที่แท่น 3 มิติ สำหรับการคลิกอย่างเป็นธรรมชาติ พร้อม Pop-up Balloon */}
          <div
            className="mdc-baworn-podium-zone"
            style={{ left: '42%', top: '18%', width: '16%', height: '32%' }}
            onClick={() => onNavigatePage('policy-1-1')}
            onMouseEnter={() => setHoveredPillar('wat')}
            onMouseLeave={() => setHoveredPillar(null)}
            title="วัดเผยแผ่ธรรมะนำพาสู่ดัชนีคุณธรรม"
          />
          <div
            className="mdc-baworn-podium-zone"
            style={{ left: '22%', top: '34%', width: '20%', height: '32%' }}
            onClick={() => onNavigatePage('policy-1-2')}
            onMouseEnter={() => setHoveredPillar('ban')}
            onMouseLeave={() => setHoveredPillar(null)}
            title="บ้านบ่มเพาะภูมิคุ้มกันทางใจสู่ทุนชีวิต"
          />
          <div
            className="mdc-baworn-podium-zone"
            style={{ left: '60%', top: '34%', width: '20%', height: '32%' }}
            onClick={() => onNavigatePage('policy-moral-lecturers')}
            onMouseEnter={() => setHoveredPillar('sch')}
            onMouseLeave={() => setHoveredPillar(null)}
            title="โรงเรียนเป็นจุดเริ่มต้นของการสร้างวิทยากรคุณธรรม"
          />
          <div
            className="mdc-baworn-podium-zone"
            style={{ left: '42%', top: '55%', width: '16%', height: '30%' }}
            onClick={() => onNavigatePage('policy-moral-credit')}
            onMouseEnter={() => setHoveredPillar('com')}
            onMouseLeave={() => setHoveredPillar(null)}
            title="ชุมชนส่งเสริมความดีเปลี่ยนเป็นคะแนนกับ Moral Credit"
          />

          {/* C. ปุ่ม 3D CSS Buttons ทั้ง 4 หัวข้อ พร้อม Pop-up Balloons เมื่อ Hover */}
          {/* ปุ่ม 1: ดัชนีคุณธรรม (สีเหลืองทอง 3D Pill) */}
          <button
            type="button"
            className="mdc-css-pill-btn btn-wat"
            onClick={() => onNavigatePage('policy-1-1')}
            onMouseEnter={() => setHoveredPillar('wat')}
            onMouseLeave={() => setHoveredPillar(null)}
            title="วัดเผยแผ่ธรรมะนำพาสู่ดัชนีคุณธรรม"
            aria-label="ไปยังหน้า ดัชนีคุณธรรม"
          >
            <span>ดัชนีคุณธรรม</span>
            <div className={`mdc-popup-balloon balloon-wat ${hoveredPillar === 'wat' ? 'is-visible' : ''}`}>
              วัดเผยแผ่ธรรมะนำพาสู่ดัชนีคุณธรรม
            </div>
          </button>

          {/* ปุ่ม 2: ทุนชีวิต (สีส้มปะการัง 3D Pill) */}
          <button
            type="button"
            className="mdc-css-pill-btn btn-ban"
            onClick={() => onNavigatePage('policy-1-2')}
            onMouseEnter={() => setHoveredPillar('ban')}
            onMouseLeave={() => setHoveredPillar(null)}
            title="บ้านบ่มเพาะภูมิคุ้มกันทางใจสู่ทุนชีวิต"
            aria-label="ไปยังหน้า ทุนชีวิต"
          >
            <span>ทุนชีวิต</span>
            <div className={`mdc-popup-balloon balloon-ban ${hoveredPillar === 'ban' ? 'is-visible' : ''}`}>
              บ้านบ่มเพาะภูมิคุ้มกันทางใจสู่ทุนชีวิต
            </div>
          </button>

          {/* ปุ่ม 3: วิทยากรคุณธรรม (สีฟ้า 3D Pill) */}
          <button
            type="button"
            className="mdc-css-pill-btn btn-sch"
            onClick={() => onNavigatePage('policy-moral-lecturers')}
            onMouseEnter={() => setHoveredPillar('sch')}
            onMouseLeave={() => setHoveredPillar(null)}
            title="โรงเรียนเป็นจุดเริ่มต้นของการสร้างวิทยากรคุณธรรม"
            aria-label="ไปยังหน้า วิทยากรคุณธรรม"
          >
            <span>วิทยากรคุณธรรม</span>
            <div className={`mdc-popup-balloon balloon-sch ${hoveredPillar === 'sch' ? 'is-visible' : ''}`}>
              โรงเรียนเป็นจุดเริ่มต้นของการสร้างวิทยากรคุณธรรม
            </div>
          </button>

          {/* ปุ่ม 4: Moral Credit (สีเขียวมรกต 3D Pill) */}
          <button
            type="button"
            className="mdc-css-pill-btn btn-com"
            onClick={() => onNavigatePage('policy-moral-credit')}
            onMouseEnter={() => setHoveredPillar('com')}
            onMouseLeave={() => setHoveredPillar(null)}
            title="ชุมชนส่งเสริมความดีเปลี่ยนเป็นคะแนนกับ Moral Credit"
            aria-label="ไปยังหน้า Moral Credit"
          >
            <span>Moral Credit</span>
            <div className={`mdc-popup-balloon balloon-com ${hoveredPillar === 'com' ? 'is-visible' : ''}`}>
              ชุมชนส่งเสริมความดีเปลี่ยนเป็นคะแนนกับ Moral Credit
            </div>
          </button>

          {/* D. กล่องข้อความ ที่มาแนวคิดและการเชื่อมโยง 4 เสาหลัก (Pure CSS Frosted Glass Card) */}
          <div className="mdc-concept-card">
            <div className="mdc-concept-header">ที่มาแนวคิดและการเชื่อมโยง 4 เสาหลักคุณธรรม:</div>
            <p className="mdc-concept-body">
              แนวคิด ‘บวร’ (บ้าน วัด โรงเรียน) คือรากฐานสำคัญในการขับเคลื่อนสังคมคุณธรรม โดย{' '}
              <strong className="hl-ban">บ้าน</strong> บ่มเพาะภูมิคุ้มกันทางใจสู่{' '}
              <strong className="hl-ban">ทุนชีวิต</strong> ระดับบุคคล,{' '}
              <strong className="hl-wat">วัด</strong> เป็นศูนย์รวมจิตใจกำกับพฤติกรรมผ่านเกณฑ์{' '}
              <strong className="hl-wat">ดัชนีคุณธรรม 5 มิติ</strong>,{' '}
              <strong className="hl-sch">โรงเรียน</strong> พัฒนาปัญญาและถ่ายทอดกระบวนการเรียนรู้ผ่าน{' '}
              <strong className="hl-sch">วิทยากรคุณธรรม</strong>, แล้วหลอมรวมสู่{' '}
              <strong className="hl-com">ชุมชน</strong> เพื่อแปลงความดีเป็นแต้มต่อทางสังคมและเศรษฐกิจในระบบ{' '}
              <strong className="hl-com">Moral Credit</strong> ที่สร้างคุณค่าอย่างยั่งยืน.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
