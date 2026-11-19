import { domToCanvas } from 'modern-screenshot';
import { jsPDF } from 'jspdf';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle
} from 'docx';

export interface DashboardExportMetadata {
  sectorTitle: string;
  viewTitle: string;
  viewSubtitle?: string;
  targetElement?: HTMLElement | null;
}

function sanitizeFilename(title: string): string {
  return title
    .replace(/[\\/:*?"<>|()]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 80) || 'Policy_Dashboard';
}

function getFormattedDate(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getThaiDateTimeString(): string {
  try {
    return new Date().toLocaleString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return new Date().toISOString();
  }
}

function resolveDashboardContainer(explicitTarget?: HTMLElement | null): HTMLElement | null {
  if (explicitTarget) return explicitTarget;
  const viewContainer = document.querySelector('.moral-view-container') as HTMLElement | null;
  if (viewContainer) return viewContainer;
  return document.querySelector('.moral-main-scroll-container') as HTMLElement | null;
}

async function captureDashboardCanvas(container: HTMLElement): Promise<HTMLCanvasElement> {
  // Ensure fonts and layout are settled before capture
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  const canvas = await domToCanvas(container, {
    scale: 2,
    backgroundColor: '#f8fafc',
    filter: (node) => {
      if (node instanceof HTMLElement) {
        if (node.dataset.exportIgnore === 'true') {
          return false;
        }
      }
      return true;
    }
  });

  return canvas;
}

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1] || '';
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Exports the currently active Policy Maker Dashboard DOM as a high-resolution .pdf file
 */
export async function exportDashboardToPdf(meta: DashboardExportMetadata): Promise<void> {
  const container = resolveDashboardContainer(meta.targetElement);
  if (!container) {
    throw new Error('ไม่พบพื้นที่ Dashboard สำหรับการส่งออกไฟล์ PDF');
  }

  const canvas = await captureDashboardCanvas(container);
  const imgData = canvas.toDataURL('image/png', 1.0);

  // Use standard 297mm width (A4 Landscape width) and proportional height so the entire dashboard is 100% intact
  const marginMm = 10;
  const contentWidthMm = 277; // 297 - 20mm margins
  const contentHeightMm = (canvas.height * contentWidthMm) / canvas.width;
  const pageWidthMm = 297;
  const pageHeightMm = Math.max(210, contentHeightMm + marginMm * 2);

  const orientation = pageWidthMm >= pageHeightMm ? 'l' : 'p';
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: [pageWidthMm, pageHeightMm],
    compress: true
  });

  // Fill soft background matching the dashboard
  pdf.setFillColor(248, 250, 252);
  pdf.rect(0, 0, pageWidthMm, pageHeightMm, 'F');

  // Render the captured dashboard onto the PDF page
  pdf.addImage(
    imgData,
    'PNG',
    marginMm,
    marginMm,
    contentWidthMm,
    contentHeightMm,
    undefined,
    'FAST'
  );

  const fileName = `${sanitizeFilename(meta.viewTitle)}_${getFormattedDate()}.pdf`;
  pdf.save(fileName);
}

/**
 * Exports the currently active Policy Maker Dashboard as a native Microsoft Word (.docx) file
 * including the full high-resolution Dashboard visual snapshot + extracted executive summary & tables.
 */
export async function exportDashboardToDocx(meta: DashboardExportMetadata): Promise<void> {
  const container = resolveDashboardContainer(meta.targetElement);
  if (!container) {
    throw new Error('ไม่พบพื้นที่ Dashboard สำหรับการส่งออกไฟล์ DOCX');
  }

  const canvas = await captureDashboardCanvas(container);
  const imgDataUrl = canvas.toDataURL('image/png', 1.0);
  const imgBytes = dataUrlToUint8Array(imgDataUrl);

  // Target width in Word document (in pixels at 96 DPI, ~640px fits A4 margins)
  const targetWidthPx = 640;
  const targetHeightPx = Math.max(200, Math.round((canvas.height * targetWidthPx) / canvas.width));

  // Extract AI Insight text if present on the dashboard
  const aiBannerEl = container.querySelector('.moral-ai-banner');
  const aiSummaryText = aiBannerEl ? (aiBannerEl.textContent || '').replace(/\s+/g, ' ').trim() : '';

  // Extract any visible HTML tables on the dashboard as editable Word tables
  const tableElements = Array.from(container.querySelectorAll('table'));
  const wordTables: (Paragraph | Table)[] = [];

  tableElements.forEach((tbl, idx) => {
    const trs = Array.from(tbl.querySelectorAll('tr'));
    if (trs.length === 0) return;

    const docxRows: TableRow[] = [];
    trs.forEach((tr, rowIdx) => {
      const cells = Array.from(tr.querySelectorAll('th, td'));
      if (cells.length === 0) return;

      const isHeader = rowIdx === 0 || tr.querySelectorAll('th').length > 0;
      const docxCells = cells.map((cell) => {
        const text = (cell.textContent || '').replace(/\s+/g, ' ').trim();
        return new TableCell({
          shading: isHeader ? { fill: 'EFF6FF' } : undefined,
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: text || '-',
                  bold: isHeader,
                  size: 20,
                  font: 'TH Sarabun New',
                  color: isHeader ? '1E3A8A' : '0F172A'
                })
              ]
            })
          ]
        });
      });

      docxRows.push(new TableRow({ children: docxCells }));
    });

    if (docxRows.length > 0) {
      wordTables.push(
        new Paragraph({
          spacing: { before: 280, after: 120 },
          children: [
            new TextRun({
              text: `ตารางข้อมูลประกอบที่ ${idx + 1}`,
              bold: true,
              size: 24,
              font: 'TH Sarabun New',
              color: '1E3A8A'
            })
          ]
        }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: docxRows
        })
      );
    }
  });

  const children: (Paragraph | Table)[] = [
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: meta.sectorTitle || 'ระดับนโยบาย (Policy Maker Dashboard)',
          bold: true,
          size: 22,
          font: 'TH Sarabun New',
          color: '2563EB'
        })
      ]
    }),
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: meta.viewTitle,
          bold: true,
          size: 32,
          font: 'TH Sarabun New',
          color: '0F172A'
        })
      ]
    })
  ];

  if (meta.viewSubtitle) {
    children.push(
      new Paragraph({
        spacing: { after: 140 },
        children: [
          new TextRun({
            text: meta.viewSubtitle,
            size: 22,
            font: 'TH Sarabun New',
            color: '475569'
          })
        ]
      })
    );
  }

  children.push(
    new Paragraph({
      spacing: { after: 240 },
      border: {
        bottom: { color: 'CBD5E1', space: 6, style: BorderStyle.SINGLE, size: 6 }
      },
      children: [
        new TextRun({
          text: `วันที่ส่งออกรายงาน: ${getThaiDateTimeString()} | ศูนย์คุณธรรม (องค์การมหาชน) - Moral Data Center`,
          size: 18,
          font: 'TH Sarabun New',
          color: '64748B'
        })
      ]
    })
  );

  // Embed the full high-resolution Dashboard Snapshot
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 160, after: 240 },
      children: [
        new ImageRun({
          type: 'png',
          data: imgBytes,
          transformation: {
            width: targetWidthPx,
            height: targetHeightPx
          }
        })
      ]
    })
  );

  // Include AI Executive Summary text if present
  if (aiSummaryText) {
    children.push(
      new Paragraph({
        spacing: { before: 200, after: 80 },
        children: [
          new TextRun({
            text: 'บทสังเคราะห์และข้อเสนอแนะเชิงนโยบาย (AI Executive Synthesis)',
            bold: true,
            size: 26,
            font: 'TH Sarabun New',
            color: '1E3A8A'
          })
        ]
      }),
      new Paragraph({
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: aiSummaryText,
            size: 22,
            font: 'TH Sarabun New',
            color: '1E293B'
          })
        ]
      })
    );
  }

  // Append any extracted editable tables
  children.push(...wordTables);

  const doc = new Document({
    sections: [
      {
        properties: {},
        children
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sanitizeFilename(meta.viewTitle)}_${getFormattedDate()}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
