import React, { useState, useRef, useEffect } from 'react';
import { OfficeDocument, DocumentVersion, DocumentComment, LanguageCode } from '../types/office';
import { translations } from '../utils/translations';
import { exportDocAsMarkdown, printCurrentDocument } from '../utils/storage';
import { encryptText, decryptText } from '../utils/crypto';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Sparkles,
  Download,
  Printer,
  History,
  MessageSquare,
  ShieldCheck,
  ShieldAlert,
  Save,
  Check,
  ChevronRight,
  Send,
  Lock,
  Unlock,
  CornerDownLeft,
  Share2,
  Users,
} from 'lucide-react';

interface DocEditorProps {
  document: OfficeDocument;
  onUpdateDocument: (doc: OfficeDocument) => void;
  language: LanguageCode;
  onBack?: () => void;
}

export const DocEditor: React.FC<DocEditorProps> = ({
  document: initialDoc,
  onUpdateDocument,
  language,
}) => {
  const t = translations[language];
  const [doc, setDoc] = useState<OfficeDocument>(initialDoc);
  const [isSaved, setIsSaved] = useState(true);
  const [showAiDrawer, setShowAiDrawer] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [encryptModalOpen, setEncryptModalOpen] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [encryptError, setEncryptError] = useState('');

  const editorRef = useRef<HTMLDivElement>(null);

  // Sync state if initialDoc changes
  useEffect(() => {
    setDoc(initialDoc);
    if (editorRef.current && editorRef.current.innerHTML !== initialDoc.content) {
      editorRef.current.innerHTML = initialDoc.content;
    }
  }, [initialDoc.id]);

  // Compute live word count & read time
  const plainText = editorRef.current?.innerText || '';
  const wordCount = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
  const charCount = plainText.length;
  const readMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // Execute formatting command using standard document.execCommand
  const execCmd = (command: string, value: string = '') => {
    window.document.execCommand(command, false, value);
    handleEditorChange();
  };

  const handleEditorChange = () => {
    if (!editorRef.current) return;
    const content = editorRef.current.innerHTML;
    const updated = {
      ...doc,
      content,
      plainText: editorRef.current.innerText,
      lastModified: 'Zojuist bewerkt',
    };
    setDoc(updated);
    setIsSaved(false);
    onUpdateDocument(updated);

    // Auto-save delay
    setTimeout(() => {
      setIsSaved(true);
    }, 1200);
  };

  // AI action handler
  const handleAiAction = async (action: string) => {
    setAiLoading(true);
    setAiResult('');
    try {
      const selectedText = window.getSelection()?.toString() || editorRef.current?.innerText || '';
      const response = await fetch('/api/ai/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          text: selectedText,
          prompt: aiPrompt,
          language,
        }),
      });

      const data = await response.json();
      if (data.error) {
        setAiResult(`Fout: ${data.error}`);
      } else {
        setAiResult(data.result);
      }
    } catch (err: any) {
      setAiResult('Kon AI-service niet bereiken. Controleer netwerkverbinding.');
    } finally {
      setAiLoading(false);
    }
  };

  // Apply AI result to document
  const insertAiResult = (replace: boolean = false) => {
    if (!aiResult || !editorRef.current) return;
    if (replace) {
      editorRef.current.innerHTML = `<p>${aiResult.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')}</p>`;
    } else {
      editorRef.current.innerHTML += `<div class="my-4 p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">${aiResult.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')}</div>`;
    }
    handleEditorChange();
    setAiResult('');
    setShowAiDrawer(false);
  };

  // Add Comment
  const handleAddComment = () => {
    if (!newCommentText.trim()) return;
    const newComment: DocumentComment = {
      id: `c-${Date.now()}`,
      author: 'Jij (Huidige gebruiker)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop',
      timestamp: 'Zojuist',
      text: newCommentText.trim(),
      resolved: false,
      replies: [],
    };
    const updated = {
      ...doc,
      comments: [newComment, ...doc.comments],
    };
    setDoc(updated);
    onUpdateDocument(updated);
    setNewCommentText('');
  };

  // Save new Version Snapshot
  const handleCreateVersion = () => {
    const newVersion: DocumentVersion = {
      id: `v${(doc.versions.length + 1).toFixed(1)}`,
      timestamp: new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
      author: 'Jij (Huidige gebruiker)',
      title: doc.title,
      content: editorRef.current?.innerHTML || doc.content,
      summary: 'Handmatig herstelpunt opgeslagen',
    };
    const updated = {
      ...doc,
      versions: [newVersion, ...doc.versions],
    };
    setDoc(updated);
    onUpdateDocument(updated);
  };

  // Restore Version
  const handleRestoreVersion = (ver: DocumentVersion) => {
    if (!editorRef.current) return;
    editorRef.current.innerHTML = ver.content;
    const updated = {
      ...doc,
      content: ver.content,
      lastModified: `Hersteld naar ${ver.id}`,
    };
    setDoc(updated);
    onUpdateDocument(updated);
    setShowVersionHistory(false);
  };

  // End-to-End Encryption Toggle
  const handleToggleEncryption = async () => {
    if (!passphrase.trim()) {
      setEncryptError('Voer een wachtwoordzin in.');
      return;
    }
    setEncryptError('');

    try {
      if (!doc.isEncrypted) {
        // Encrypt document content
        const raw = editorRef.current?.innerHTML || doc.content;
        const res = await encryptText(raw, passphrase);
        const updated: OfficeDocument = {
          ...doc,
          isEncrypted: true,
          encryptedPayload: res.ciphertext,
          salt: res.salt,
          iv: res.iv,
          content: '<p class="text-slate-400 italic">🔒 Dit document is end-to-end versleuteld met 256-bit AES-GCM. Ontgrendel om te bewerken.</p>',
        };
        setDoc(updated);
        onUpdateDocument(updated);
        if (editorRef.current) editorRef.current.innerHTML = updated.content;
        setEncryptModalOpen(false);
        setPassphrase('');
      } else {
        // Decrypt document content
        if (!doc.encryptedPayload || !doc.salt || !doc.iv) {
          throw new Error('Geen versleutelde payload gevonden.');
        }
        const decrypted = await decryptText(doc.encryptedPayload, passphrase, doc.salt, doc.iv);
        const updated: OfficeDocument = {
          ...doc,
          isEncrypted: false,
          encryptedPayload: undefined,
          salt: undefined,
          iv: undefined,
          content: decrypted,
        };
        setDoc(updated);
        onUpdateDocument(updated);
        if (editorRef.current) editorRef.current.innerHTML = decrypted;
        setEncryptModalOpen(false);
        setPassphrase('');
      }
    } catch (err: any) {
      setEncryptError(err.message || 'Onjuist wachtwoord of encryptiefout.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      {/* Top Document Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={doc.title}
            onChange={(e) => {
              const updated = { ...doc, title: e.target.value };
              setDoc(updated);
              onUpdateDocument(updated);
            }}
            className="text-xl sm:text-2xl font-bold bg-transparent text-slate-900 dark:text-white border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 focus:outline-hidden transition px-1 py-0.5"
            placeholder="Document titel..."
          />
          {doc.isEncrypted && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" /> 256-bit E2EE
            </span>
          )}
        </div>

        {/* Action Buttons: Save Status, AI, Comments, Versions, Encrypt, Export */}
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
          {/* Save Status Badge */}
          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Opgeslagen</span>
              </>
            ) : (
              <span className="text-amber-500 font-medium">Opslaan...</span>
            )}
          </span>

          {/* AI Writing Assistant Button */}
          <button
            onClick={() => setShowAiDrawer(!showAiDrawer)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold shadow-md shadow-blue-500/20 hover:scale-102 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Assistent</span>
          </button>

          {/* Comments Sidebar Toggle */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1 transition relative"
            title="Team Reacties"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">({doc.comments.length})</span>
          </button>

          {/* Version History Toggle */}
          <button
            onClick={() => setShowVersionHistory(!showVersionHistory)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1 transition"
            title="Versiegeschiedenis"
          >
            <History className="w-4 h-4" />
          </button>

          {/* Encrypt / Decrypt Vault Toggle */}
          <button
            onClick={() => setEncryptModalOpen(true)}
            className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1 transition ${
              doc.isEncrypted
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
            title="End-to-End Encryptie instellen"
          >
            {doc.isEncrypted ? <Lock className="w-4 h-4 text-emerald-600" /> : <Unlock className="w-4 h-4" />}
          </button>

          {/* Export Markdown */}
          <button
            onClick={() => exportDocAsMarkdown(doc)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
            title="Exporteer naar Markdown (.md)"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Print to PDF */}
          <button
            onClick={printCurrentDocument}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
            title="Afdrukken of opslaan als PDF"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Rich Toolbar */}
      <div className="sticky top-16 z-20 flex items-center flex-wrap gap-1 p-2 bg-slate-100 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
        {/* Headings */}
        <button
          onClick={() => execCmd('formatBlock', '<h1>')}
          className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
          title="Kop 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          onClick={() => execCmd('formatBlock', '<h2>')}
          className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
          title="Kop 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => execCmd('formatBlock', '<h3>')}
          className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
          title="Kop 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Text Styles */}
        <button
          onClick={() => execCmd('bold')}
          className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition"
          title="Vetgedrukt (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => execCmd('italic')}
          className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 italic transition"
          title="Cursief (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => execCmd('underline')}
          className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 underline transition"
          title="Onderstreept (Ctrl+U)"
        >
          <Underline className="w-4 h-4" />
        </button>
        <button
          onClick={() => execCmd('strikeThrough')}
          className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
          title="Doorhalen"
        >
          <Strikethrough className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Lists & Quotes */}
        <button
          onClick={() => execCmd('insertUnorderedList')}
          className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
          title="Opsomming"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => execCmd('insertOrderedList')}
          className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
          title="Genummerde lijst"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          onClick={() => execCmd('formatBlock', '<blockquote>')}
          className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
          title="Citaat"
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          onClick={() => execCmd('formatBlock', '<pre>')}
          className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
          title="Codeblok"
        >
          <Code className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Alignments */}
        <button
          onClick={() => execCmd('justifyLeft')}
          className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
          title="Links uitlijnen"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => execCmd('justifyCenter')}
          className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
          title="Centreren"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          onClick={() => execCmd('justifyRight')}
          className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
          title="Rechts uitlijnen"
        >
          <AlignRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => execCmd('justifyFull')}
          className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
          title="Uitvullen"
        >
          <AlignJustify className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Body + Side Drawers (AI, Comments, History) */}
      <div className="flex gap-6 relative">
        {/* Document Page Canvas */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md p-6 sm:p-12 min-h-[700px] relative">
          {/* Simulated Real-Time Co-Author Presence Marker */}
          <div className="absolute top-4 right-6 flex items-center gap-2 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-semibold animate-pulse select-none">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>Sophie de Vries leest mee</span>
          </div>

          <div
            ref={editorRef}
            contentEditable={!doc.isEncrypted}
            onInput={handleEditorChange}
            className="prose prose-slate dark:prose-invert max-w-none focus:outline-hidden min-h-[550px] text-slate-800 dark:text-slate-200 leading-relaxed [&>h1]:text-2xl [&>h1]:font-extrabold [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mt-6 [&>h3]:text-lg [&>h3]:font-semibold [&>p]:my-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>blockquote]:border-l-4 [&>blockquote]:border-blue-500 [&>blockquote]:pl-4 [&>blockquote]:italic [&>pre]:bg-slate-100 [&>pre]:dark:bg-slate-800 [&>pre]:p-3 [&>pre]:rounded-xl"
            dangerouslySetInnerHTML={{ __html: doc.content }}
          />

          {/* Document Footer: Word Count, Char Count, Read Time */}
          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 select-none">
            <div className="flex items-center gap-4">
              <span>{wordCount} woorden</span>
              <span>{charCount} tekens</span>
              <span>~{readMinutes} min leestijd</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Cloud auto-save gereed</span>
            </div>
          </div>
        </div>

        {/* AI Assistant Sidebar Drawer */}
        {showAiDrawer && (
          <div className="w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4 shrink-0 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Gemini 3.8 Tekst Assistent</span>
              </div>
              <button
                onClick={() => setShowAiDrawer(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
              >
                Sluiten
              </button>
            </div>

            {/* Quick Action Chips */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleAiAction('summarize')}
                disabled={aiLoading}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 font-medium text-left border border-slate-200/60 dark:border-slate-700/60 transition"
              >
                📝 Samenvatten
              </button>
              <button
                onClick={() => handleAiAction('fix_grammar')}
                disabled={aiLoading}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 font-medium text-left border border-slate-200/60 dark:border-slate-700/60 transition"
              >
                ✨ Grammatica corrigeren
              </button>
              <button
                onClick={() => handleAiAction('professional_tone')}
                disabled={aiLoading}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 font-medium text-left border border-slate-200/60 dark:border-slate-700/60 transition"
              >
                💼 Zakelijke toon
              </button>
              <button
                onClick={() => handleAiAction('expand')}
                disabled={aiLoading}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 font-medium text-left border border-slate-200/60 dark:border-slate-700/60 transition"
              >
                🚀 Uitbreiden
              </button>
            </div>

            {/* Custom Prompt Box */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Vrije AI Instructie
              </label>
              <div className="relative">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Bijv: 'Voeg een conclusie toe over ROI en kostenreductie'..."
                  rows={3}
                  className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleAiAction('generate')}
                  disabled={aiLoading}
                  className="absolute bottom-2.5 right-2.5 p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* AI Result Container */}
            {aiLoading && (
              <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 text-center text-xs text-blue-600 dark:text-blue-400 font-medium animate-pulse">
                Gemini 3.8 denkt na en formuleert suggestie...
              </div>
            )}

            {aiResult && !aiLoading && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 max-h-56 overflow-y-auto whitespace-pre-wrap">
                  {aiResult}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => insertAiResult(false)}
                    className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition"
                  >
                    Invoegen in tekst
                  </button>
                  <button
                    onClick={() => insertAiResult(true)}
                    className="py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-white font-semibold text-xs transition"
                  >
                    Vervang alles
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Team Comments Sidebar */}
        {showComments && (
          <div className="w-80 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4 shrink-0 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                Team Opmerkingen ({doc.comments.length})
              </span>
              <button
                onClick={() => setShowComments(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
              >
                Sluiten
              </button>
            </div>

            {/* New Comment Input */}
            <div className="space-y-2">
              <textarea
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Plaats een opmerking voor het team..."
                rows={2}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddComment}
                className="w-full py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition"
              >
                Opmerking plaatsen
              </button>
            </div>

            {/* Comments Stream */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {doc.comments.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <img src={c.avatar} alt={c.author} className="w-5 h-5 rounded-full object-cover" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{c.author}</span>
                    <span className="text-[10px] text-slate-400 ml-auto">{c.timestamp}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-normal">{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Version History Sidebar */}
        {showVersionHistory && (
          <div className="w-80 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4 shrink-0 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                Versiegeschiedenis
              </span>
              <button
                onClick={() => setShowVersionHistory(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
              >
                Sluiten
              </button>
            </div>

            <button
              onClick={handleCreateVersion}
              className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Nieuw herstelpunt opslaan</span>
            </button>

            <div className="space-y-2.5 max-h-96 overflow-y-auto">
              {doc.versions.map((v) => (
                <div
                  key={v.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-600 dark:text-blue-400">{v.id}</span>
                    <span className="text-[10px] text-slate-400">{v.timestamp}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px]">{v.summary}</p>
                  <button
                    onClick={() => handleRestoreVersion(v)}
                    className="w-full py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold text-[11px] hover:bg-blue-100 transition mt-1"
                  >
                    Herstel deze versie
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* End-to-End Encryption Setup Modal */}
      {encryptModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  {doc.isEncrypted ? 'Document Ontsleutelen' : 'End-to-End Versleuteling'}
                </h3>
                <p className="text-xs text-slate-500">
                  Client-side 256-bit AES-GCM met PBKDF2 sleutelafleiding
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {doc.isEncrypted
                ? 'Voer je geheime kluiswachtwoord in om de inhoud veilig in het geheugen te ontsleutelen.'
                : 'Versleutel dit document op je apparaat voordat het gesynchroniseerd wordt. Zelfs cloudproviders kunnen de inhoud niet inzien.'}
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Wachtwoordzin (Passphrase)
              </label>
              <input
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Typ een sterk wachtwoord..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            {encryptError && (
              <p className="text-xs font-semibold text-red-500">{encryptError}</p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEncryptModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Annuleren
              </button>
              <button
                onClick={handleToggleEncryption}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition"
              >
                {doc.isEncrypted ? 'Ontsleutelen' : 'Nu Versleutelen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
