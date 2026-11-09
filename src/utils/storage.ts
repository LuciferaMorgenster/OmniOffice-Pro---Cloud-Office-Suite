import { OfficeDocument, SpreadsheetDoc, PresentationDoc, NoteItem, TaskItem } from '../types/office';

const STORAGE_KEY = 'omnioffice_suite_data_v1';

export interface OfficeAppState {
  docs: OfficeDocument[];
  sheets: SpreadsheetDoc[];
  slides: PresentationDoc[];
  notes: NoteItem[];
  tasks: TaskItem[];
  theme: string;
  isDark: boolean;
  language: string;
  vaultUnlocked: boolean;
}

export function loadOfficeState(): OfficeAppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load local state:', e);
    return null;
  }
}

export function saveOfficeState(state: OfficeAppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save local state:', e);
  }
}

// Export entire office suite state to JSON file download
export function exportSuiteBackup(state: OfficeAppState): void {
  const jsonStr = JSON.stringify(state, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `OmniOffice_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Export single Document to Markdown
export function exportDocAsMarkdown(doc: OfficeDocument): void {
  // Strip HTML or convert simple HTML to Markdown
  let text = doc.content
    .replace(/<h1>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3>(.*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<p>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<em>(.*?)<\/em>/gi, '*$1*')
    .replace(/<li>(.*?)<\/li>/gi, '- $1\n')
    .replace(/<blockquote>(.*?)<\/blockquote>/gi, '> $1\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '');

  const blob = new Blob([`# ${doc.title}\n\n*Auteur: ${doc.author} | Laatst bewerkt: ${doc.lastModified}*\n\n---\n\n${text}`], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${doc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

// Export Spreadsheet to CSV format
export function exportSheetAsCsv(sheet: SpreadsheetDoc): void {
  const rows: string[][] = [];
  const colLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  for (let r = 1; r <= sheet.rowCount; r++) {
    const rowData: string[] = [];
    let hasData = false;
    for (let c = 0; c < sheet.colCount; c++) {
      const cellKey = `${colLetters[c]}${r}`;
      const cell = sheet.cells[cellKey];
      const val = cell ? (cell.computed !== undefined ? String(cell.computed) : cell.value) : '';
      if (val) hasData = true;
      // Escape CSV
      const escaped = `"${val.replace(/"/g, '""')}"`;
      rowData.push(escaped);
    }
    if (hasData || r <= 8) {
      rows.push(rowData);
    }
  }

  const csvContent = rows.map(r => r.join(';')).join('\n'); // European semicolon delimiter standard
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sheet.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// Export Tasks / Deadlines to iCalendar (.ics) format
export function exportTasksToCalendar(tasks: TaskItem[]): void {
  let icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//OmniOffice Pro//NL',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  tasks.forEach((task, idx) => {
    const dt = task.dueDate.replace(/-/g, '');
    icsLines.push('BEGIN:VEVENT');
    icsLines.push(`UID:omni-task-${task.id}-${idx}@omnioffice.nl`);
    icsLines.push(`DTSTAMP:${dt}T090000Z`);
    icsLines.push(`DTSTART;VALUE=DATE:${dt}`);
    icsLines.push(`SUMMARY:OmniOffice: ${task.title}`);
    icsLines.push(`DESCRIPTION:Prioriteit: ${task.priority.toUpperCase()} - Toegewezen aan: ${task.assignedTo}`);
    icsLines.push('STATUS:CONFIRMED');
    icsLines.push('END:VEVENT');
  });

  icsLines.push('END:VCALENDAR');
  const blob = new Blob([icsLines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `OmniOffice_Deadlines_${new Date().toISOString().slice(0, 10)}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

// Print trigger (for PDF saving via system print dialog)
export function printCurrentDocument(): void {
  window.print();
}
