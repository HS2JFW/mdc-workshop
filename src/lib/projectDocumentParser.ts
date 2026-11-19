import * as XLSX from 'xlsx';
import mammoth from 'mammoth';

export interface ParsedDocumentResult {
  text: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  pageCountEstimate?: number;
  extractedSnippet: string;
}

/**
 * Extracts plain text from various document formats:
 * - .docx (via mammoth)
 * - .odt (OpenDocument text XML extraction)
 * - .xlsx / .xls (via sheetjs XLSX)
 * - .csv / .tsv (plain text with delimiter parsing)
 * - .pdf (text-based PDF stream extractor - excludes scanned image OCR per user specs)
 * - .txt / .md / .json
 */
export async function parseProjectDocument(file: File): Promise<ParsedDocumentResult> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const fileSize = file.size;
  let text = '';

  try {
    // 1. Plain Text, CSV, TSV, Markdown, JSON
    if (['txt', 'csv', 'tsv', 'md', 'json'].includes(extension)) {
      text = await readTextFileWithEncoding(file);
    }
    // 2. Microsoft Word .docx
    else if (['docx', 'docm'].includes(extension)) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      text = result.value || '';
    }
    // 3. Microsoft Excel .xlsx, .xls
    else if (['xlsx', 'xls', 'xlsm'].includes(extension)) {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetTexts: string[] = [];

      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        if (worksheet) {
          const csvContent = XLSX.utils.sheet_to_csv(worksheet, { blankrows: false });
          if (csvContent && csvContent.trim()) {
            sheetTexts.push(`--- แผ่นงาน: ${sheetName} ---\n${csvContent}`);
          }
        }
      }
      text = sheetTexts.join('\n\n');
    }
    // 4. OpenDocument .odt
    else if (extension === 'odt') {
      const arrayBuffer = await file.arrayBuffer();
      text = extractTextFromOdtBuffer(arrayBuffer);
    }
    // 5. PDF (Text-based, non-scanned)
    else if (extension === 'pdf') {
      const arrayBuffer = await file.arrayBuffer();
      text = extractTextFromPdfBuffer(arrayBuffer, file.name);
    }
    // 6. Fallback for other formats (.doc legacy, etc.)
    else {
      const arrayBuffer = await file.arrayBuffer();
      const decoder = new TextDecoder('windows-874');
      const raw = decoder.decode(new Uint8Array(arrayBuffer));
      text = cleanPrintableText(raw);
    }
  } catch (err: any) {
    console.warn(`Error parsing file ${file.name}:`, err);
    // Graceful fallback
    text = `เอกสารโครงการ: ${file.name} (ขนาด ${(fileSize / 1024).toFixed(1)} KB)`;
  }

  // Final sanitization of parsed text
  const cleanedText = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const snippet = cleanedText.slice(0, 320) + (cleanedText.length > 320 ? '...' : '');

  return {
    text: cleanedText,
    fileName: file.name,
    fileSize,
    fileType: extension,
    pageCountEstimate: Math.max(1, Math.ceil(cleanedText.length / 1500)),
    extractedSnippet: snippet || `[ไฟล์ ${file.name} ไม่พบข้อความที่สามารถอ่านได้โดยตรง]`
  };
}

/**
 * Reads text file with UTF-8, falls back to Windows-874 if garbled Thai is detected
 */
async function readTextFileWithEncoding(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const utf8Decoder = new TextDecoder('utf-8');
  const utf8Text = utf8Decoder.decode(new Uint8Array(arrayBuffer));

  // If text has replacement character (indicating invalid UTF-8) or no Thai characters when expected, try windows-874
  if (utf8Text.includes('\uFFFD')) {
    try {
      const win874Decoder = new TextDecoder('windows-874');
      return win874Decoder.decode(new Uint8Array(arrayBuffer));
    } catch {
      return utf8Text;
    }
  }
  return utf8Text;
}

/**
 * Extracts plain text from ODT array buffer by inspecting XML string streams
 */
function extractTextFromOdtBuffer(buffer: ArrayBuffer): string {
  const decoder = new TextDecoder('utf-8');
  const raw = decoder.decode(new Uint8Array(buffer));

  // Simple and fast XML paragraph tag parser
  const paragraphMatches: string[] = [];
  const pRegex = /<text:p[^>]*>([\s\S]*?)<\/text:p>/gi;
  let match: RegExpExecArray | null;

  while ((match = pRegex.exec(raw)) !== null) {
    const pContent = match[1].replace(/<[^>]+>/g, '').trim();
    if (pContent) {
      paragraphMatches.push(pContent);
    }
  }

  if (paragraphMatches.length > 0) {
    return paragraphMatches.join('\n');
  }

  return cleanPrintableText(raw);
}

/**
 * Text-based PDF extractor (reads stream objects without OCR)
 */
function extractTextFromPdfBuffer(buffer: ArrayBuffer, fileName: string): string {
  const decoder = new TextDecoder('utf-8');
  const content = decoder.decode(new Uint8Array(buffer));

  const textMatches: string[] = [];
  const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
  let match: RegExpExecArray | null;

  while ((match = streamRegex.exec(content)) !== null) {
    const streamData = match[1];
    // Find strings in (text) Tj or [(text)] TJ
    const tjRegex = /\(([^)]+)\)\s*Tj/g;
    let tjMatch: RegExpExecArray | null;
    while ((tjMatch = tjRegex.exec(streamData)) !== null) {
      textMatches.push(tjMatch[1]);
    }
  }

  if (textMatches.length > 0) {
    return textMatches.join(' ').replace(/\\([()\\])/g, '$1');
  }

  // Fallback: extract Thai & alphanumeric character runs
  const cleaned = cleanPrintableText(content);
  if (cleaned.length > 80) {
    return cleaned;
  }

  return `เอกสารโครงการ (PDF: ${fileName}): กรุณาตรวจสอบหรือเพิ่มเติมเนื้อหารายละเอียดในกล่องข้อความ`;
}

/**
 * Cleans raw binary string into printable Thai and alphanumeric characters
 */
function cleanPrintableText(raw: string): string {
  return raw
    .replace(/[^\u0E00-\u0E7Fa-zA-Z0-9\s.,;:()\-_\/"'%#@+=]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
