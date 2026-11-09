import React, { useState, useEffect } from 'react';
import { OfficeDocument, SpreadsheetDoc, PresentationDoc, NoteItem, LanguageCode } from '../types/office';
import { translations } from '../utils/translations';
import { Search, FileText, TableProperties, Presentation, CheckSquare, ScanLine, ArrowRight, X } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  docs: OfficeDocument[];
  sheets: SpreadsheetDoc[];
  slides: PresentationDoc[];
  notes: NoteItem[];
  onSelectDoc: (id: string) => void;
  onSelectSheet: (id: string) => void;
  onSelectSlide: (id: string) => void;
  onSelectNote: (id: string) => void;
  language: LanguageCode;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  docs,
  sheets,
  slides,
  notes,
  onSelectDoc,
  onSelectSheet,
  onSelectSlide,
  onSelectNote,
  language,
}) => {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'doc' | 'sheet' | 'slide' | 'note'>('all');
  const t = translations[language];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle or open search
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Search in Docs
  const matchedDocs = docs.filter(
    (d) =>
      !q ||
      d.title.toLowerCase().includes(q) ||
      (d.plainText || d.content).toLowerCase().includes(q) ||
      d.tags.some((t) => t.toLowerCase().includes(q))
  );

  // Search in Sheets
  const matchedSheets = sheets.filter(
    (s) =>
      !q ||
      s.title.toLowerCase().includes(q) ||
      Object.values(s.cells).some((c) => String(c.value).toLowerCase().includes(q)) ||
      s.tags.some((t) => t.toLowerCase().includes(q))
  );

  // Search in Slides
  const matchedSlides = slides.filter(
    (sl) =>
      !q ||
      sl.title.toLowerCase().includes(q) ||
      sl.slides.some(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.bulletPoints.some((b) => b.toLowerCase().includes(q))
      )
  );

  // Search in Notes (includes simulated OCR on attachments!)
  const matchedNotes = notes.filter((n) => {
    if (!q) return true;
    const inText = n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
    const inTags = n.tags.some((t) => t.toLowerCase().includes(q));
    const inOcr = n.attachments?.some((a) => a.name.toLowerCase().includes(q) || q.includes('diagram') || q.includes('api'));
    return inText || inTags || inOcr;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 p-4 animate-fadeIn">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Typ om te zoeken in documenten, cijfers, slides, notities & OCR..."
            className="w-full text-sm bg-transparent text-slate-900 dark:text-white focus:outline-hidden"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200"
          >
            Esc
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              filterType === 'all'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Alles
          </button>
          <button
            onClick={() => setFilterType('doc')}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              filterType === 'doc'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Documenten ({matchedDocs.length})
          </button>
          <button
            onClick={() => setFilterType('sheet')}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              filterType === 'sheet'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Rekenbladen ({matchedSheets.length})
          </button>
          <button
            onClick={() => setFilterType('slide')}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              filterType === 'slide'
                ? 'bg-amber-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Presentaties ({matchedSlides.length})
          </button>
          <button
            onClick={() => setFilterType('note')}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              filterType === 'note'
                ? 'bg-purple-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Notities & OCR ({matchedNotes.length})
          </button>
        </div>

        {/* Results Stream */}
        <div className="p-4 space-y-2 overflow-y-auto flex-1">
          {/* Docs */}
          {(filterType === 'all' || filterType === 'doc') &&
            matchedDocs.map((doc) => (
              <div
                key={doc.id}
                onClick={() => {
                  onSelectDoc(doc.id);
                  onClose();
                }}
                className="p-3 rounded-xl hover:bg-blue-50/70 dark:hover:bg-blue-950/40 border border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-blue-600">
                      {doc.title}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Document • Auteur: {doc.author} • {doc.lastModified}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition" />
              </div>
            ))}

          {/* Sheets */}
          {(filterType === 'all' || filterType === 'sheet') &&
            matchedSheets.map((sheet) => (
              <div
                key={sheet.id}
                onClick={() => {
                  onSelectSheet(sheet.id);
                  onClose();
                }}
                className="p-3 rounded-xl hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 transition cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 shrink-0">
                    <TableProperties className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600">
                      {sheet.title}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Rekenblad • {sheet.rowCount} rijen • {sheet.lastModified}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition" />
              </div>
            ))}

          {/* Slides */}
          {(filterType === 'all' || filterType === 'slide') &&
            matchedSlides.map((slide) => (
              <div
                key={slide.id}
                onClick={() => {
                  onSelectSlide(slide.id);
                  onClose();
                }}
                className="p-3 rounded-xl hover:bg-amber-50/70 dark:hover:bg-amber-950/40 border border-transparent hover:border-amber-200 dark:hover:border-amber-800 transition cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 shrink-0">
                    <Presentation className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-amber-600">
                      {slide.title}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Presentatie • {slide.slides.length} slides • {slide.lastModified}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 transition" />
              </div>
            ))}

          {/* Notes */}
          {(filterType === 'all' || filterType === 'note') &&
            matchedNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => {
                  onSelectNote(note.id);
                  onClose();
                }}
                className="p-3 rounded-xl hover:bg-purple-50/70 dark:hover:bg-purple-950/40 border border-transparent hover:border-purple-200 dark:hover:border-purple-800 transition cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 shrink-0">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-purple-600">
                        {note.title}
                      </h4>
                      {note.attachments && (
                        <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-1 rounded">
                          <ScanLine className="w-3 h-3" /> OCR
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate max-w-md">
                      {note.content}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 transition" />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
