import React, { useState, useEffect } from 'react';
import { PresentationDoc, SlideItem, LanguageCode } from '../types/office';
import { translations } from '../utils/translations';
import {
  Presentation,
  Play,
  Plus,
  Trash2,
  Copy,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Clock,
  Palette,
  FileText,
  Layout,
  X,
} from 'lucide-react';

interface SlideEditorProps {
  presentation: PresentationDoc;
  onUpdatePresentation: (pres: PresentationDoc) => void;
  language: LanguageCode;
}

export const SlideEditor: React.FC<SlideEditorProps> = ({
  presentation: initialPres,
  onUpdatePresentation,
  language,
}) => {
  const t = translations[language];
  const [pres, setPres] = useState<PresentationDoc>(initialPres);
  const [activeSlideIdx, setActiveSlideIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playTimer, setPlayTimer] = useState<number>(0);
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [aiTopic, setAiTopic] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  useEffect(() => {
    setPres(initialPres);
  }, [initialPres.id]);

  // Presentation Timer
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlayTimer((prev) => prev + 1);
      }, 1000);
    } else {
      setPlayTimer(0);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Keyboard navigation during presentation mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        setActiveSlideIdx((prev) => Math.min(prev + 1, pres.slides.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setActiveSlideIdx((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        setIsPlaying(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, pres.slides.length]);

  const currentSlide = pres.slides[activeSlideIdx] || pres.slides[0];

  const updateCurrentSlide = (updates: Partial<SlideItem>) => {
    const newSlides = [...pres.slides];
    newSlides[activeSlideIdx] = {
      ...newSlides[activeSlideIdx],
      ...updates,
    };
    const updated = { ...pres, slides: newSlides, lastModified: 'Zojuist bewerkt' };
    setPres(updated);
    onUpdatePresentation(updated);
  };

  const handleAddSlide = () => {
    const newSlide: SlideItem = {
      id: `s-${Date.now()}`,
      title: 'Nieuwe Slide',
      subtitle: 'Ondertitel toevoegen',
      bulletPoints: ['Eerste belangrijke punt', 'Tweede kernpunt'],
      layout: 'content',
      bgColor: '#1e293b',
      textColor: '#f8fafc',
      notes: 'Sprekersnotities...',
    };
    const updated = {
      ...pres,
      slides: [...pres.slides, newSlide],
    };
    setPres(updated);
    onUpdatePresentation(updated);
    setActiveSlideIdx(pres.slides.length);
  };

  const handleDuplicateSlide = (idx: number) => {
    const target = pres.slides[idx];
    const clone: SlideItem = {
      ...target,
      id: `s-${Date.now()}`,
      title: `${target.title} (Kopie)`,
    };
    const newSlides = [...pres.slides];
    newSlides.splice(idx + 1, 0, clone);
    const updated = { ...pres, slides: newSlides };
    setPres(updated);
    onUpdatePresentation(updated);
    setActiveSlideIdx(idx + 1);
  };

  const handleDeleteSlide = (idx: number) => {
    if (pres.slides.length <= 1) return;
    const newSlides = pres.slides.filter((_, i) => i !== idx);
    const updated = { ...pres, slides: newSlides };
    setPres(updated);
    onUpdatePresentation(updated);
    setActiveSlideIdx(Math.max(0, idx - 1));
  };

  // AI Slide Generation via Gemini 3.8
  const handleGenerateSlidesAi = async () => {
    if (!aiTopic.trim()) return;
    setAiLoading(true);
    try {
      const response = await fetch('/api/ai/slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic,
          slideCount: 4,
          language,
        }),
      });
      const data = await response.json();
      if (data.slides && Array.isArray(data.slides)) {
        const generatedSlides: SlideItem[] = data.slides.map((s: any, idx: number) => ({
          id: `s-ai-${idx}-${Date.now()}`,
          title: s.title || `Slide ${idx + 1}`,
          subtitle: s.subtitle || '',
          bulletPoints: s.bulletPoints || [],
          layout: idx === 0 ? 'title' : 'content',
          bgColor: s.bgColor || '#0f172a',
          textColor: s.textColor || '#ffffff',
          notes: s.notes || '',
        }));

        const updated = {
          ...pres,
          title: aiTopic,
          slides: generatedSlides,
          lastModified: 'AI gegenereerd',
        };
        setPres(updated);
        onUpdatePresentation(updated);
        setActiveSlideIdx(0);
        setShowAiModal(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  const bgPresets = [
    { name: 'Nacht Blauw', hex: '#0f172a' },
    { name: 'Diep Indigo', hex: '#1e1b4b' },
    { name: 'Smaragd Donker', hex: '#022c22' },
    { name: 'Zakelijk Leisteen', hex: '#1e293b' },
    { name: 'Minimal Wit', hex: '#ffffff' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      {/* Presentation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={pres.title}
            onChange={(e) => {
              const updated = { ...pres, title: e.target.value };
              setPres(updated);
              onUpdatePresentation(updated);
            }}
            className="text-xl sm:text-2xl font-bold bg-transparent text-slate-900 dark:text-white border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-amber-500 focus:outline-hidden transition px-1 py-0.5"
          />
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-semibold">
            {pres.slides.length} {t.slidesCount}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* AI Generator Button */}
          <button
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold shadow-md shadow-amber-500/20 hover:scale-102 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Slide Maker</span>
          </button>

          {/* Full-Screen Present Mode Button */}
          <button
            onClick={() => setIsPlaying(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{t.present}</span>
          </button>
        </div>
      </div>

      {/* Main Slide Editor Split */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Slide Strip / Thumbnails */}
        <div className="w-full lg:w-64 space-y-3 shrink-0">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Dia Overzicht
            </span>
            <button
              onClick={handleAddSlide}
              className="p-1 rounded-md text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition"
              title="Slide toevoegen"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
            {pres.slides.map((s, idx) => {
              const isSelected = activeSlideIdx === idx;
              return (
                <div
                  key={s.id}
                  onClick={() => setActiveSlideIdx(idx)}
                  className={`p-3 rounded-2xl border transition cursor-pointer relative group flex items-start gap-3 ${
                    isSelected
                      ? 'border-amber-500 ring-2 ring-amber-500/40 bg-white dark:bg-slate-900 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="text-xs font-mono font-bold text-slate-400 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {s.title || `Slide ${idx + 1}`}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {s.subtitle || `${s.bulletPoints.length} punten`}
                    </p>
                  </div>

                  {/* Actions on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateSlide(idx);
                      }}
                      className="p-1 text-slate-400 hover:text-amber-500"
                      title="Dupliceren"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {pres.slides.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSlide(idx);
                        }}
                        className="p-1 text-slate-400 hover:text-red-500"
                        title="Verwijderen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Canvas: Active Slide Canvas */}
        <div className="flex-1 space-y-4">
          {/* Active Slide Canvas Preview */}
          <div
            className="w-full aspect-16/9 rounded-3xl p-8 sm:p-14 shadow-2xl flex flex-col justify-between transition-all duration-300 relative border border-white/10 overflow-hidden"
            style={{
              backgroundColor: currentSlide.bgColor,
              color: currentSlide.textColor,
            }}
          >
            {/* Slide Title & Subtitle editing */}
            <div className="space-y-3">
              <input
                type="text"
                value={currentSlide.title}
                onChange={(e) => updateCurrentSlide({ title: e.target.value })}
                className="w-full text-2xl sm:text-4xl font-extrabold bg-transparent border-b border-transparent hover:border-white/20 focus:border-white/50 focus:outline-hidden transition"
                placeholder="Slide titel..."
              />
              <input
                type="text"
                value={currentSlide.subtitle}
                onChange={(e) => updateCurrentSlide({ subtitle: e.target.value })}
                className="w-full text-base sm:text-lg font-medium opacity-80 bg-transparent border-b border-transparent hover:border-white/20 focus:border-white/50 focus:outline-hidden transition"
                placeholder="Ondertitel of thema..."
              />
            </div>

            {/* Bullet Points */}
            <div className="space-y-3 my-4">
              {currentSlide.bulletPoints.map((point, pIdx) => (
                <div key={pIdx} className="flex items-center gap-3 group">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                  <input
                    type="text"
                    value={point}
                    onChange={(e) => {
                      const newPts = [...currentSlide.bulletPoints];
                      newPts[pIdx] = e.target.value;
                      updateCurrentSlide({ bulletPoints: newPts });
                    }}
                    className="w-full text-sm sm:text-base bg-transparent border-b border-transparent hover:border-white/20 focus:border-white/50 focus:outline-hidden transition"
                  />
                  <button
                    onClick={() => {
                      const newPts = currentSlide.bulletPoints.filter((_, i) => i !== pIdx);
                      updateCurrentSlide({ bulletPoints: newPts });
                    }}
                    className="opacity-0 group-hover:opacity-100 text-xs text-red-400 hover:text-red-300 p-1"
                  >
                    ×
                  </button>
                </div>
              ))}

              <button
                onClick={() => {
                  updateCurrentSlide({
                    bulletPoints: [...currentSlide.bulletPoints, 'Nieuw bulletpunt...'],
                  });
                }}
                className="text-xs font-semibold opacity-60 hover:opacity-100 flex items-center gap-1 mt-2 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Punt toevoegen</span>
              </button>
            </div>

            {/* Slide Footer */}
            <div className="flex items-center justify-between text-xs opacity-50 font-medium">
              <span>OmniOffice Enterprise Presentation</span>
              <span>
                {activeSlideIdx + 1} / {pres.slides.length}
              </span>
            </div>
          </div>

          {/* Color & Theme Presets + Speaker Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Color Presets */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-500" /> Achtergrondthema
              </span>
              <div className="flex items-center gap-2">
                {bgPresets.map((bg) => (
                  <button
                    key={bg.hex}
                    onClick={() =>
                      updateCurrentSlide({
                        bgColor: bg.hex,
                        textColor: bg.hex === '#ffffff' ? '#0f172a' : '#f8fafc',
                      })
                    }
                    className="w-8 h-8 rounded-full border-2 border-slate-300 dark:border-slate-700 shadow-xs hover:scale-110 transition relative"
                    style={{ backgroundColor: bg.hex }}
                    title={bg.name}
                  />
                ))}
              </div>
            </div>

            {/* Speaker Notes */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-500" /> Sprekersnotities
              </span>
              <textarea
                value={currentSlide.notes || ''}
                onChange={(e) => updateCurrentSlide({ notes: e.target.value })}
                placeholder="Notities voor tijdens de live presentatie..."
                rows={2}
                className="w-full text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Full-Screen Presentation Mode Overlay */}
      {isPlaying && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-8 sm:p-16 select-none animate-fadeIn">
          {/* Presentation Top Control Bar */}
          <div className="flex items-center justify-between text-white/80">
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold tracking-wide">
                {pres.title}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-white/10 px-3 py-1 rounded-full">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTimer(playTimer)}</span>
              </div>
            </div>
            <button
              onClick={() => setIsPlaying(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              title="Presentatie sluiten (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Presentation Slide Content */}
          <div
            className="w-full max-w-5xl mx-auto aspect-16/9 rounded-3xl p-12 sm:p-20 shadow-2xl flex flex-col justify-between transition-all"
            style={{
              backgroundColor: currentSlide.bgColor,
              color: currentSlide.textColor,
            }}
          >
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
                {currentSlide.title}
              </h1>
              {currentSlide.subtitle && (
                <p className="text-xl sm:text-2xl opacity-80 font-medium">
                  {currentSlide.subtitle}
                </p>
              )}
            </div>

            <div className="space-y-4 my-8">
              {currentSlide.bulletPoints.map((pt, i) => (
                <div key={i} className="flex items-center gap-4 text-xl sm:text-2xl font-light">
                  <span className="w-3 h-3 rounded-full bg-amber-400 shrink-0" />
                  <span>{pt}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm opacity-60">
              <span>OmniOffice Live Presentatie</span>
              <span>
                {activeSlideIdx + 1} van {pres.slides.length}
              </span>
            </div>
          </div>

          {/* Bottom Navigation Controls */}
          <div className="flex items-center justify-center gap-4 text-white">
            <button
              disabled={activeSlideIdx === 0}
              onClick={() => setActiveSlideIdx((prev) => Math.max(0, prev - 1))}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 transition"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <span className="text-sm font-semibold px-4">
              {activeSlideIdx + 1} / {pres.slides.length}
            </span>
            <button
              disabled={activeSlideIdx === pres.slides.length - 1}
              onClick={() => setActiveSlideIdx((prev) => Math.min(pres.slides.length - 1, prev + 1))}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 transition"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* AI Slide Generator Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  AI Slide Generator (Gemini 3.8)
                </h3>
                <p className="text-xs text-slate-500">
                  Genereer in enkele seconden een complete presentatie
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Onderwerp of thema
              </label>
              <input
                type="text"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="Bijv. Kwartaalpresentatie Q4, Nieuwe Productlancering..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 transition"
              >
                Annuleren
              </button>
              <button
                onClick={handleGenerateSlidesAi}
                disabled={aiLoading || !aiTopic.trim()}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-md transition disabled:opacity-50"
              >
                {aiLoading ? 'Genereert slides...' : 'Genereer Presentatie'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
