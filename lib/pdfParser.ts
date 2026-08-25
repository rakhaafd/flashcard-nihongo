import { KotobaItem } from '@/types/kotoba';

export interface ParsedPdfResult {
  lessonId: number;
  items: Omit<KotobaItem, 'id'>[];
  rawText?: string;
  isAiParsed?: boolean;
}

export async function parseKotobaPdf(file: File): Promise<ParsedPdfResult> {
  const arrayBuffer = await file.arrayBuffer();

  // Dynamically import pdfjs-dist
  const pdfjsLib = await import('pdfjs-dist');
  
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  }

  try {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;

    let fullText = '';
    let detectedLessonId = 1;

    const pageTextRows: { y: number; x: number; text: string }[][] = [];

    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const textPosItems = textContent.items
        .map((item: any) => {
          const text = item.str.trim();
          if (!text) return null;
          return { text, x: item.transform[4], y: item.transform[5] };
        })
        .filter(Boolean) as { text: string; x: number; y: number }[];

      textPosItems.sort((a, b) => b.y - a.y || a.x - b.x);

      let currentY = -1;
      let currentGroup: { text: string; x: number; y: number }[] = [];

      for (const item of textPosItems) {
        const lessonMatch = item.text.match(/(?:第\s*(\d+)\s*課|Bab\s*(\d+))/i);
        if (lessonMatch) {
          detectedLessonId = parseInt(lessonMatch[1] || lessonMatch[2], 10);
        }

        fullText += item.text + ' ';

        if (currentY === -1 || Math.abs(item.y - currentY) < 6) {
          currentGroup.push(item);
          currentY = item.y;
        } else {
          if (currentGroup.length > 0) {
            currentGroup.sort((a, b) => a.x - b.x);
            pageTextRows.push(currentGroup);
          }
          currentGroup = [item];
          currentY = item.y;
        }
      }
      if (currentGroup.length > 0) {
        currentGroup.sort((a, b) => a.x - b.x);
        pageTextRows.push(currentGroup);
      }
    }

    // Try AI parsing first via API route
    try {
      const aiResponse = await fetch('/api/parse-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: fullText }),
      });

      if (aiResponse.ok) {
        const aiResult = await aiResponse.json();
        if (aiResult.items && Array.isArray(aiResult.items) && aiResult.items.length > 0) {
          return {
            lessonId: aiResult.lessonId || detectedLessonId,
            items: aiResult.items.map((item: any, idx: number) => ({
              lessonId: aiResult.lessonId || detectedLessonId,
              no: Number(item.no) || idx + 1,
              kana: String(item.kana || '').trim(),
              kanji: String(item.kanji || '').trim(),
              arti: String(item.arti || '').trim(),
            })),
            rawText: fullText,
            isAiParsed: true,
          };
        }
      }
    } catch (aiErr) {
      console.warn('AI Parsing skipped or unavailable, using smart character classifier fallback:', aiErr);
    }

    // Character Set Classifier Fallback Parsing
    const items: Omit<KotobaItem, 'id'>[] = [];

    for (const row of pageTextRows) {
      if (row.length === 0) continue;
      const firstText = row[0].text;
      const numberMatch = firstText.match(/^(\d+)$/);
      if (!numberMatch) continue;

      const rowNo = parseInt(numberMatch[1], 10);
      const restCells = row.slice(1).map((r) => r.text);

      if (restCells.length === 0) continue;

      let kana = '';
      let kanji = '';
      const artiParts: string[] = [];

      for (const cell of restCells) {
        // Rule 1: Contains Latin letters [a-zA-Z]? MUST BE Indonesian translation (arti)!
        if (/[a-zA-Z]/.test(cell)) {
          artiParts.push(cell);
        } 
        // Rule 2: Contains Kanji [\u4E00-\u9FAF]? Place into kanji
        else if (/[\u4E00-\u9FAF]/.test(cell)) {
          kanji = kanji ? `${kanji} ${cell}` : cell;
        } 
        // Rule 3: Contains Hiragana/Katakana [\u3040-\u30FF]? Place into kana
        else if (/[\u3040-\u30FF]/.test(cell)) {
          kana = kana ? `${kana} ${cell}` : cell;
        } 
        // Punctuation / brackets
        else {
          if (!kana) kana = cell;
          else if (!kanji && !/[a-zA-Z]/.test(cell)) kanji = cell;
          else artiParts.push(cell);
        }
      }

      const arti = artiParts.join(' ').trim();

      if (kana || kanji || arti) {
        items.push({
          lessonId: detectedLessonId,
          no: rowNo,
          kana: kana.trim(),
          kanji: kanji.trim(),
          arti: arti.trim(),
        });
      }
    }

    items.sort((a, b) => a.no - b.no);

    return {
      lessonId: detectedLessonId,
      items,
      rawText: fullText,
      isAiParsed: false,
    };
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Gagal memproses file PDF. Pastikan file berupa PDF tabel kotoba yang valid.');
  }
}
