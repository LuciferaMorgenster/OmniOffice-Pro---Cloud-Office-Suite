import { SheetData } from '../types/office';

// Helper to expand range like "B2:B6" or "B2:E2" into array of cell keys
export function expandRange(rangeStr: string): string[] {
  const parts = rangeStr.toUpperCase().trim().split(':');
  if (parts.length !== 2) return [rangeStr.toUpperCase().trim()];

  const start = parts[0];
  const end = parts[1];

  const startCol = start.match(/[A-Z]+/)?.[0] || 'A';
  const startRow = parseInt(start.match(/\d+/)?.[0] || '1', 10);
  const endCol = end.match(/[A-Z]+/)?.[0] || 'A';
  const endRow = parseInt(end.match(/\d+/)?.[0] || '1', 10);

  const startColCode = startCol.charCodeAt(0);
  const endColCode = endCol.charCodeAt(0);

  const minCol = Math.min(startColCode, endColCode);
  const maxCol = Math.max(startColCode, endColCode);
  const minRow = Math.min(startRow, endRow);
  const maxRow = Math.max(startRow, endRow);

  const cells: string[] = [];
  for (let c = minCol; c <= maxCol; c++) {
    const colLetter = String.fromCharCode(c);
    for (let r = minRow; r <= maxRow; r++) {
      cells.push(`${colLetter}${r}`);
    }
  }
  return cells;
}

// Get raw numerical or string value of a cell
export function getCellValue(cellKey: string, sheetData: SheetData): number {
  const cell = sheetData[cellKey];
  if (!cell) return 0;
  const raw = cell.computed !== undefined ? String(cell.computed) : cell.value;
  if (!raw) return 0;
  const cleaned = raw.replace(/[€$£%\s]/g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

// Evaluate formula or raw value
export function evaluateCell(cellKey: string, rawFormula: string, sheetData: SheetData): string | number {
  if (!rawFormula.startsWith('=')) {
    return rawFormula;
  }

  const expr = rawFormula.slice(1).trim().toUpperCase();

  // SOM / SUM
  const sumMatch = expr.match(/^(?:SOM|SUM)\((.+)\)$/);
  if (sumMatch) {
    const cells = expandRange(sumMatch[1]);
    const total = cells.reduce((acc, k) => acc + (k === cellKey ? 0 : getCellValue(k, sheetData)), 0);
    return Math.round(total * 100) / 100;
  }

  // GEMIDDELDE / AVERAGE
  const avgMatch = expr.match(/^(?:GEMIDDELDE|AVERAGE)\((.+)\)$/);
  if (avgMatch) {
    const cells = expandRange(avgMatch[1]);
    if (cells.length === 0) return 0;
    const total = cells.reduce((acc, k) => acc + (k === cellKey ? 0 : getCellValue(k, sheetData)), 0);
    return Math.round((total / cells.length) * 100) / 100;
  }

  // MIN
  const minMatch = expr.match(/^MIN\((.+)\)$/);
  if (minMatch) {
    const cells = expandRange(minMatch[1]);
    const vals = cells.map(k => getCellValue(k, sheetData));
    return vals.length ? Math.min(...vals) : 0;
  }

  // MAX
  const maxMatch = expr.match(/^MAX\((.+)\)$/);
  if (maxMatch) {
    const cells = expandRange(maxMatch[1]);
    const vals = cells.map(k => getCellValue(k, sheetData));
    return vals.length ? Math.max(...vals) : 0;
  }

  // AANTAL / COUNT
  const countMatch = expr.match(/^(?:AANTAL|COUNT)\((.+)\)$/);
  if (countMatch) {
    const cells = expandRange(countMatch[1]);
    const validCount = cells.filter(k => sheetData[k]?.value !== undefined && sheetData[k]?.value !== '').length;
    return validCount;
  }

  // ALS / IF (e.g. ALS(B2>100, "Hoog", "Laag"))
  const ifMatch = rawFormula.slice(1).match(/^(?:ALS|IF)\((.+?),\s*(.+?),\s*(.+?)\)$/i);
  if (ifMatch) {
    try {
      const cond = ifMatch[1].replace(/([A-Z]+[0-9]+)/gi, (match) => {
        return String(getCellValue(match.toUpperCase(), sheetData));
      });
      // safe eval simple numeric condition
      // eslint-disable-next-line no-new-func
      const isTrue = Function(`"use strict"; return (${cond})`)();
      const trueVal = ifMatch[2].trim().replace(/^["']|["']$/g, '');
      const falseVal = ifMatch[3].trim().replace(/^["']|["']$/g, '');
      return isTrue ? trueVal : falseVal;
    } catch {
      return '#FOUT!';
    }
  }

  // Basic arithmetic evaluation (e.g., =B2*1.21 or =B2+B3)
  try {
    const sanitized = expr.replace(/([A-Z]+[0-9]+)/g, (match) => {
      if (match === cellKey) return '0';
      return String(getCellValue(match, sheetData));
    });
    if (/^[0-9+\-*/().\s]+$/.test(sanitized)) {
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${sanitized})`)();
      return typeof result === 'number' && !isNaN(result) ? Math.round(result * 100) / 100 : '#FOUT!';
    }
  } catch {
    return '#FOUT!';
  }

  return rawFormula;
}

// Recalculate entire sheet
export function recomputeSheet(sheetData: SheetData): SheetData {
  const updated: SheetData = {};
  for (const [key, cell] of Object.entries(sheetData)) {
    if (cell.value && cell.value.startsWith('=')) {
      const computed = evaluateCell(key, cell.value, sheetData);
      updated[key] = { ...cell, computed };
    } else {
      updated[key] = { ...cell, computed: cell.value };
    }
  }
  return updated;
}

// Format display value based on format setting
export function formatCellValue(value: string | number | undefined, format?: string): string {
  if (value === undefined || value === null || value === '') return '';
  if (typeof value === 'string' && isNaN(Number(value)) && !value.startsWith('=')) {
    return value;
  }

  const num = typeof value === 'number' ? value : parseFloat(String(value).replace(',', '.'));
  if (isNaN(num)) return String(value);

  if (format === 'currency') {
    return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(num);
  }
  if (format === 'percent') {
    return `${(num * 100).toFixed(1)}%`;
  }
  if (format === 'number') {
    return new Intl.NumberFormat('nl-NL').format(num);
  }

  return String(value);
}
