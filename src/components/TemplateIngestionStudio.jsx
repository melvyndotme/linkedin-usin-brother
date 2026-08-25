import React, { useState } from 'react';
import { Layers, Upload, Link2, FileText, Image as ImageIcon, Sparkles, Copy, Check, ArrowRight, BookOpen, Eye } from 'lucide-react';
import { BENCHMARK_TEMPLATES, extractTemplateFromInput } from '../lib/templateExtractor.js';

export default function TemplateIngestionStudio({ isDark, onSelectTemplateForDrafting }) {
  const [activeTab, setActiveTab] = useState('library'); // 'library' or 'ingest'
  const [templates, setTemplates] = useState(BENCHMARK_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState(BENCHMARK_TEMPLATES[0]);
  const [copied, setCopied] = useState(false);

  // Ingestion inputs
  const [ingestType, setIngestType] = useState('url'); // 'url', 'screenshot', 'pdf'
  const [urlInput, setUrlInput] = useState('');
  const [pastedContent, setPastedContent] = useState('');
  const [uploadFileName, setUploadFileName] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateExtraction = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      const newTmpl = extractTemplateFromInput({
        type: ingestType,
        content: urlInput || pastedContent || `Uploaded asset: ${uploadFileName}`,
        title: ingestType === 'url' ? 'Extracted Social Post Strategy' : ingestType === 'screenshot' ? 'Screenshot Vision Template' : 'PDF Archive Template'
      });
      setTemplates([newTmpl, ...templates]);
      setSelectedTemplate(newTmpl);
      setActiveTab('library');
      setUrlInput('');
      setPastedContent('');
      setUploadFileName('');
    }, 1200);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFileName(file.name);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className={`p-4 sm:p-6 rounded-2xl border transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0f2ea2]/10 text-[#0f2ea2] dark:text-blue-400 text-[11px] font-bold uppercase tracking-wider mb-1.5 sm:mb-2">
              <Layers className="w-3.5 h-3.5" />
              Template Ingestion & Competitive Learning Studio
            </div>
            <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Brother Group & Competitor Post Template Library
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Reverse-engineer high-performing posts from Brother Global, Brother AP, Canon SG, Epson SG, and HP SG into 
              <strong className="text-[#0f2ea2] dark:text-blue-400"> instructional placeholder templates</strong> ready for AI drafting.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab(activeTab === 'library' ? 'ingest' : 'library')}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-[#0f2ea2] hover:bg-[#0c2482] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
            >
              {activeTab === 'library' ? <Upload className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
              {activeTab === 'library' ? '+ Ingest New Post / PDF' : 'View Template Library'}
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'ingest' ? (
        /* Ingestion Studio Panel */
        <div className={`p-5 sm:p-6 rounded-2xl border space-y-5 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="border-b pb-3 dark:border-slate-800">
            <h3 className={`text-sm sm:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Ingest Post, Screenshot, or PDF to Train Templates
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              The multimodal engine analyzes structure, hook formula, tone, and formatting to extract reusable instructional placeholders.
            </p>
          </div>

          {/* Ingestion Mode Switcher */}
          <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border dark:border-slate-800">
            <button
              onClick={() => setIngestType('url')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                ingestType === 'url' ? 'bg-[#0f2ea2] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Link2 className="w-4 h-4" />
              <span>Social Post URL</span>
            </button>
            <button
              onClick={() => setIngestType('screenshot')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                ingestType === 'screenshot' ? 'bg-[#0f2ea2] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Screenshot (PNG/JPG)</span>
            </button>
            <button
              onClick={() => setIngestType('pdf')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                ingestType === 'pdf' ? 'bg-[#0f2ea2] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>PDF Archive</span>
            </button>
          </div>

          {/* Form Inputs based on Ingestion Type */}
          {ingestType === 'url' && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                LinkedIn Post Link (Brother Global or Competitor)
              </label>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://www.linkedin.com/posts/brother-global_kaizen-innovation-..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:border-[#0f2ea2] focus:outline-none"
              />
            </div>
          )}

          {ingestType === 'screenshot' && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Upload Post Screenshot (PNG/JPG)
              </label>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-6 text-center hover:border-[#0f2ea2] transition-colors cursor-pointer relative bg-slate-50/50 dark:bg-slate-950/40">
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {uploadFileName ? `Selected: ${uploadFileName}` : 'Drag & drop post screenshot, or click to browse'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Supports screenshots of LinkedIn mobile or desktop posts</p>
              </div>
            </div>
          )}

          {ingestType === 'pdf' && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Upload Printed Post Archive or Guidelines (PDF)
              </label>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-6 text-center hover:border-[#0f2ea2] transition-colors cursor-pointer relative bg-slate-50/50 dark:bg-slate-950/40">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {uploadFileName ? `Selected: ${uploadFileName}` : 'Drop PDF archive of competitor/Brother posts'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Extracts structural patterns across multi-page post collections</p>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleSimulateExtraction}
            disabled={analyzing}
            className="w-full flex items-center justify-center gap-2 bg-[#0f2ea2] hover:bg-[#0c2482] text-white text-xs font-bold py-3 rounded-xl shadow-md transition-all disabled:opacity-50 active:scale-95"
          >
            <Sparkles className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
            {analyzing ? 'Deconstructing Structure & Extracting Template...' : 'Extract Instructional Template'}
          </button>
        </div>
      ) : (
        /* Template Library & Instructional Placeholder Explorer */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Left: Template List */}
          <div className="lg:col-span-4 space-y-4">
            <div className={`p-3.5 sm:p-4 rounded-2xl border ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Template Library ({templates.length})
                </h3>
                <span className="text-[10px] font-mono text-[#0f2ea2] dark:text-blue-400">Ready for AI</span>
              </div>

              <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1 custom-scrollbar">
                {templates.map((tmpl) => {
                  const isSelected = selectedTemplate.id === tmpl.id;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => setSelectedTemplate(tmpl)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-50/80 border-[#0f2ea2] dark:bg-blue-950/50 dark:border-blue-500 shadow-sm'
                          : isDark
                            ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold line-clamp-1 ${
                          isSelected ? 'text-[#0f2ea2] dark:text-blue-300' : isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                          {tmpl.name}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                          {tmpl.category}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-1">{tmpl.source}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Template Details & Instructional Placeholders */}
          <div className="lg:col-span-8 space-y-4 sm:space-y-6">
            <div className={`p-4 sm:p-6 rounded-2xl border space-y-5 ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3.5 dark:border-slate-800">
                <div>
                  <span className="text-[10px] sm:text-[11px] font-mono text-[#0f2ea2] dark:text-blue-400 font-bold uppercase tracking-wider block">
                    Source: {selectedTemplate.source}
                  </span>
                  <h3 className={`text-base sm:text-lg font-bold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {selectedTemplate.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedTemplate.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(selectedTemplate.placeholderTemplate)}
                    className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>

                  <button
                    onClick={() => onSelectTemplateForDrafting(selectedTemplate)}
                    className="flex items-center gap-1.5 bg-[#0f2ea2] hover:bg-[#0c2482] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
                  >
                    <span>Use Template to Draft Post</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Frontmatter YAML Preview */}
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  1. Frontmatter YAML Metadata
                </span>
                <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-emerald-300 overflow-x-auto custom-scrollbar">
                  {selectedTemplate.frontmatterYaml}
                </pre>
              </div>

              {/* Instructional Placeholder Body */}
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  2. Template with Instructional Placeholder Text (AI Prompt Structure)
                </span>
                <div className={`p-4 rounded-xl font-mono text-xs whitespace-pre-wrap leading-relaxed border max-h-64 overflow-y-auto custom-scrollbar ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}>
                  {selectedTemplate.placeholderTemplate}
                </div>
              </div>

              {/* Example AI Generated Post Output */}
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  3. Sample Live Post Generated with this Template
                </span>
                <div className={`p-4 rounded-xl text-xs whitespace-pre-wrap leading-relaxed border ${
                  isDark ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-slate-50/60 border-slate-200 text-slate-700'
                }`}>
                  {selectedTemplate.examplePost}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
