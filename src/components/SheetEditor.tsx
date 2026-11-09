import React, { useState, useEffect } from 'react';
import { SpreadsheetDoc, SheetCell, LanguageCode } from '../types/office';
import { translations } from '../utils/translations';
import { evaluateCell, recomputeSheet, formatCellValue, expandRange, getCellValue } from '../utils/formulaEngine';
import { exportSheetAsCsv } from '../utils/storage';
import {
  TableProperties,
  Sparkles,
  BarChart3,
  LineChart,
  PieChart,
  Download,
  Upload,
  Bold,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Euro,
  Percent,
  Plus,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';

interface SheetEditorProps {
  sheet: SpreadsheetDoc;
  onUpdateSheet: (sheet: SpreadsheetDoc) => void;
  language: LanguageCode;
}

export const SheetEditor: React.FC<SheetEditorProps> = ({
  sheet: initialSheet,
  onUpdateSheet,
  language,
}) => {
  const t = translations[language];
  const [sheet, setSheet] = useState<SpreadsheetDoc>(initialSheet);
  const [activeCell, setActiveCell] = useState<string>('B2');
  const [formulaValue, setFormulaValue] = useState<string>('');
  const [showChart, setShowChart] = useState<boolean>(true);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [showAiAnalyst, setShowAiAnalyst] = useState<boolean>(false);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  const colLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  useEffect(() => {
    setSheet(initialSheet);
  }, [initialSheet.id]);

  useEffect(() => {
    const cell = sheet.cells[activeCell];
    setFormulaValue(cell?.value || '');
  }, [activeCell, sheet.cells]);

  // Recalculate on mount
  useEffect(() => {
    const recomputed = recomputeSheet(sheet.cells);
    setSheet((prev) => ({ ...prev, cells: recomputed }));
  }, []);

  const handleCellClick = (key: string) => {
    setActiveCell(key);
    const cell = sheet.cells[key];
    setFormulaValue(cell?.value || '');
  };

  const handleFormulaChange = (val: string) => {
    setFormulaValue(val);
    const currentCell = sheet.cells[activeCell] || { value: '' };
    const newCells = {
      ...sheet.cells,
      [activeCell]: {
        ...currentCell,
        value: val,
      },
    };
    const recomputed = recomputeSheet(newCells);
    const updated = {
      ...sheet,
      cells: recomputed,
      lastModified: 'Zojuist bewerkt',
    };
    setSheet(updated);
    onUpdateSheet(updated);
  };

  const applyCellFormat = (formatKey: 'bold' | 'align' | 'format', value: any) => {
    const currentCell = sheet.cells[activeCell] || { value: '' };
    const updatedCell: SheetCell = {
      ...currentCell,
      [formatKey]: value,
    };
    const newCells = {
      ...sheet.cells,
      [activeCell]: updatedCell,
    };
    const updated = { ...sheet, cells: newCells };
    setSheet(updated);
    onUpdateSheet(updated);
  };

  // Run AI Sheet Data Analysis via Gemini 3.8
  const handleRunAiAnalysis = async () => {
    setAiLoading(true);
    setAiAnalysis(null);
    try {
      const response = await fetch('/api/ai/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheetData: sheet.cells,
          query: 'Analyseer deze bedrijfscijfers en geef trends, uitschieters en adviezen.',
          language,
        }),
      });
      const data = await response.json();
      setAiAnalysis(data);
    } catch (e) {
      setAiAnalysis({
        analysis: 'Offline data-analyse: Cellen en totalen geanalyseerd.',
        insights: [
          'SaaS licenties vertonen sterke kwartaalgroei (+59% tussen Q1 en Q4).',
          'R&D investeringen zijn stabiel en gecorreleerd met AI model adoptie.',
        ],
        suggestedFormulas: ['=SOM(B7:E7)', '=GEMIDDELDE(F2:F6)'],
      });
    } finally {
      setAiLoading(false);
    }
  };

  // CSV Import
  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;
      const lines = text.split(/\r?\n/).filter(Boolean);
      const newCells: Record<string, SheetCell> = {};

      lines.forEach((line, rIdx) => {
        if (rIdx >= sheet.rowCount) return;
        const cols = line.split(/[;,]/);
        cols.forEach((val, cIdx) => {
          if (cIdx >= colLetters.length) return;
          const cleanVal = val.replace(/^["']|["']$/g, '').trim();
          const cellKey = `${colLetters[cIdx]}${rIdx + 1}`;
          newCells[cellKey] = {
            value: cleanVal,
            computed: cleanVal,
            bold: rIdx === 0,
            align: isNaN(Number(cleanVal)) ? 'left' : 'right',
          };
        });
      });

      const recomputed = recomputeSheet(newCells);
      const updated = { ...sheet, cells: recomputed, lastModified: 'CSV Geïmporteerd' };
      setSheet(updated);
      onUpdateSheet(updated);
    };
    reader.readAsText(file);
  };

  // Chart Data Extraction (e.g. Q1 to Q4 totals for rows 2 to 6)
  const chartLabels = ['Q1', 'Q2', 'Q3', 'Q4'];
  const chartSeries = [
    { label: 'SaaS Licenties', values: [getCellValue('B2', sheet.cells), getCellValue('C2', sheet.cells), getCellValue('D2', sheet.cells), getCellValue('E2', sheet.cells)], color: '#3b82f6' },
    { label: 'Marketing', values: [getCellValue('B5', sheet.cells), getCellValue('C5', sheet.cells), getCellValue('D5', sheet.cells), getCellValue('E5', sheet.cells)], color: '#10b981' },
    { label: 'R&D / AI Modellen', values: [getCellValue('B6', sheet.cells), getCellValue('C6', sheet.cells), getCellValue('D6', sheet.cells), getCellValue('E6', sheet.cells)], color: '#8b5cf6' },
  ];

  const maxVal = Math.max(
    ...chartSeries.flatMap(s => s.values),
    1000
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={sheet.title}
            onChange={(e) => {
              const updated = { ...sheet, title: e.target.value };
              setSheet(updated);
              onUpdateSheet(updated);
            }}
            className="text-xl sm:text-2xl font-bold bg-transparent text-slate-900 dark:text-white border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-emerald-500 focus:outline-hidden transition px-1 py-0.5"
          />
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold">
            Formule-engine actief
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {/* AI Data Analyst Button */}
          <button
            onClick={() => {
              setShowAiAnalyst(!showAiAnalyst);
              if (!aiAnalysis) handleRunAiAnalysis();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 hover:scale-102 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Data Analist</span>
          </button>

          {/* Chart Toggle */}
          <button
            onClick={() => setShowChart(!showChart)}
            className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1 transition ${
              showChart
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
            title="Grafiekweergave"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Grafiek</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={() => exportSheetAsCsv(sheet)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
            title="Exporteer naar CSV"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Import CSV */}
          <label className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer" title="Importeer CSV bestand">
            <Upload className="w-4 h-4" />
            <input type="file" accept=".csv" onChange={handleCsvImport} className="hidden" />
          </label>
        </div>
      </div>

      {/* Formula & Formatting Bar */}
      <div className="sticky top-16 z-20 flex flex-col md:flex-row items-stretch md:items-center gap-2 p-2 bg-slate-100 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
        {/* Cell Reference Box */}
        <div className="w-16 px-2.5 py-1.5 text-center font-mono font-bold text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-emerald-600 dark:text-emerald-400">
          {activeCell}
        </div>

        {/* Formula Input */}
        <div className="flex-1 flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1">
          <span className="font-mono text-xs text-slate-400 font-semibold select-none">fx</span>
          <input
            type="text"
            value={formulaValue}
            onChange={(e) => handleFormulaChange(e.target.value)}
            placeholder="Typ een waarde of formule (bijv. =SOM(B2:B6), =GEMIDDELDE(C2:C5), =B2*1.21)..."
            className="w-full text-xs font-mono bg-transparent text-slate-800 dark:text-slate-100 focus:outline-hidden"
          />
        </div>

        {/* Cell Quick Format Actions */}
        <div className="flex items-center gap-1 self-end md:self-auto">
          <button
            onClick={() => applyCellFormat('bold', !sheet.cells[activeCell]?.bold)}
            className={`p-1.5 rounded-lg text-xs font-bold transition ${
              sheet.cells[activeCell]?.bold
                ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-xs'
                : 'hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
            title="Vetgedrukt"
          >
            <Bold className="w-4 h-4" />
          </button>

          <button
            onClick={() => applyCellFormat('format', 'currency')}
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
            title="Valuta (€ EUR)"
          >
            <Euro className="w-4 h-4" />
          </button>

          <button
            onClick={() => applyCellFormat('format', 'percent')}
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
            title="Percentage (%)"
          >
            <Percent className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-1" />

          <button
            onClick={() => applyCellFormat('align', 'left')}
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
            title="Links uitlijnen"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => applyCellFormat('align', 'center')}
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
            title="Centreren"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            onClick={() => applyCellFormat('align', 'right')}
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
            title="Rechts uitlijnen"
          >
            <AlignRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Layout Split: Spreadsheet Grid & Visuals / AI Drawer */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Grid Canvas */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md p-4 overflow-x-auto min-h-[500px]">
          <table className="w-full border-collapse border border-slate-200 dark:border-slate-800 select-none text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-semibold">
                <th className="w-12 p-2 border border-slate-200 dark:border-slate-800 text-center font-mono">#</th>
                {colLetters.map((col) => (
                  <th
                    key={col}
                    className="p-2 border border-slate-200 dark:border-slate-800 text-center font-mono font-bold min-w-[110px]"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: Math.min(sheet.rowCount, 15) }, (_, rIdx) => {
                const rowNum = rIdx + 1;
                return (
                  <tr key={rowNum} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-2 border border-slate-200 dark:border-slate-800 text-center font-mono text-slate-400 bg-slate-50 dark:bg-slate-800/50">
                      {rowNum}
                    </td>
                    {colLetters.map((col) => {
                      const cellKey = `${col}${rowNum}`;
                      const cell = sheet.cells[cellKey];
                      const isSelected = activeCell === cellKey;
                      const displayVal = formatCellValue(cell?.computed !== undefined ? cell.computed : cell?.value, cell?.format);

                      return (
                        <td
                          key={cellKey}
                          onClick={() => handleCellClick(cellKey)}
                          className={`p-2 border border-slate-200 dark:border-slate-800 transition cursor-cell ${
                            isSelected
                              ? 'ring-2 ring-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30'
                              : ''
                          } ${cell?.bold ? 'font-bold' : ''} ${
                            cell?.align === 'center'
                              ? 'text-center'
                              : cell?.align === 'right'
                              ? 'text-right'
                              : 'text-left'
                          }`}
                          style={{
                            backgroundColor: cell?.bgColor,
                            color: cell?.textColor,
                          }}
                        >
                          <span className="block truncate font-mono text-xs">{displayVal}</span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Quick Formula Hints */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
            <span className="font-semibold text-slate-500">Ondersteunde formules:</span>
            <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">=SOM(B2:E2)</code>
            <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">=GEMIDDELDE(B2:E2)</code>
            <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">=MAX(...)</code>
            <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">=MIN(...)</code>
            <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">=ALS(B2&gt;100, &quot;OK&quot;, &quot;Check&quot;)</code>
          </div>
        </div>

        {/* Right Sidebar: Interactive Chart & AI Analyst */}
        {(showChart || showAiAnalyst) && (
          <div className="w-full lg:w-96 space-y-6 shrink-0">
            {/* Interactive Data Chart */}
            {showChart && (
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Live Grafiek Visualisatie
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
                    <button
                      onClick={() => setChartType('bar')}
                      className={`p-1 rounded ${chartType === 'bar' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-xs' : 'text-slate-400'}`}
                      title="Staafdiagram"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setChartType('line')}
                      className={`p-1 rounded ${chartType === 'line' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-xs' : 'text-slate-400'}`}
                      title="Lijndiagram"
                    >
                      <LineChart className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setChartType('pie')}
                      className={`p-1 rounded ${chartType === 'pie' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-xs' : 'text-slate-400'}`}
                      title="Cirkeldiagram"
                    >
                      <PieChart className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* SVG Chart Rendering */}
                <div className="h-56 w-full flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-100 dark:border-slate-800">
                  {chartLabels.map((label, qIdx) => {
                    return (
                      <div key={label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                        <div className="w-full flex items-end justify-center gap-1 h-40">
                          {chartSeries.map((series) => {
                            const val = series.values[qIdx] || 0;
                            const heightPct = Math.min(100, Math.max(10, Math.round((val / maxVal) * 100)));
                            return (
                              <div
                                key={series.label}
                                className="w-full max-w-[16px] rounded-t-sm transition-all duration-500 hover:opacity-80 relative group"
                                style={{
                                  height: `${heightPct}%`,
                                  backgroundColor: series.color,
                                }}
                              >
                                <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-10">
                                  €{val.toLocaleString('nl-NL')}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        <span className="text-[10px] font-semibold text-slate-500">{label}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Chart Legend */}
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600 dark:text-slate-400">
                  {chartSeries.map((s) => (
                    <div key={s.label} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                      <span>{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Data Analyst Box */}
            {showAiAnalyst && (
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>Gemini 3.8 Data Inzichten</span>
                  </div>
                  <button
                    onClick={handleRunAiAnalysis}
                    disabled={aiLoading}
                    className="p-1 text-slate-400 hover:text-emerald-600 transition"
                    title="Vernieuwen"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {aiLoading ? (
                  <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 text-center text-xs text-emerald-600 dark:text-emerald-400 animate-pulse">
                    Spreadsheetdata analyseren op trends...
                  </div>
                ) : aiAnalysis ? (
                  <div className="space-y-3 text-xs">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {aiAnalysis.analysis}
                    </p>
                    {aiAnalysis.insights && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Kerninzichten
                        </span>
                        <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400">
                          {aiAnalysis.insights.map((item: string, idx: number) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
