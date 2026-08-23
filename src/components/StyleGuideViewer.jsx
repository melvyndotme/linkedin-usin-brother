import React, { useState } from 'react';
import { BookOpen, Compass, FileCode, CheckCircle, Copy, Check, ChevronRight } from 'lucide-react';
import { YAML_TEMPLATES } from '../lib/yamlTemplates.js';

export default function StyleGuideViewer() {
  const [activeSubTab, setActiveSubTab] = useState('templates'); // 'style-guide', 'hofstede', 'templates'
  const [selectedTemplate, setSelectedTemplate] = useState(YAML_TEMPLATES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('templates')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'templates'
              ? 'bg-[#005BAC] text-white shadow-md shadow-blue-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <FileCode className="w-4 h-4" />
          YAML Frontmatter Template Library (Phase 2)
        </button>
        <button
          onClick={() => setActiveSubTab('hofstede')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'hofstede'
              ? 'bg-[#005BAC] text-white shadow-md shadow-blue-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Compass className="w-4 h-4" />
          Hofstede Cultural Tuning Matrix (Japan × Singapore)
        </button>
        <button
          onClick={() => setActiveSubTab('style-guide')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'style-guide'
              ? 'bg-[#005BAC] text-white shadow-md shadow-blue-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Brother SG Editorial Style Guide (Phase 1)
        </button>
      </div>

      {/* Sub-tab 1: YAML Templates Library */}
      {activeSubTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                Registered YAML Templates ({YAML_TEMPLATES.length})
              </h3>
              <div className="space-y-2">
                {YAML_TEMPLATES.map((tmpl) => {
                  const isSelected = selectedTemplate.id === tmpl.id;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => setSelectedTemplate(tmpl)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-950/60 border-blue-500 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-white">{tmpl.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-blue-300">
                          {tmpl.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono line-clamp-1">{tmpl.id}.yaml</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">{selectedTemplate.name}</h3>
                  <span className="text-xs text-slate-400">Tone: {selectedTemplate.tone}</span>
                </div>
                <button
                  onClick={() => handleCopy(selectedTemplate.rawYaml)}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied YAML' : 'Copy Template'}
                </button>
              </div>

              <div>
                <span className="text-xs font-mono text-blue-400 uppercase tracking-wider block mb-2">
                  Frontmatter Schema & Rules
                </span>
                <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed custom-scrollbar">
                  {selectedTemplate.rawYaml}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 2: Hofstede Cultural Tuning */}
      {activeSubTab === 'hofstede' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white">Hofstede Cultural Tuning Compass (Japan HQ × Singapore Context)</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Calibrates AI prompts to bridge Japanese corporate values (*Wa*, *Kaizen*, precision) with Singapore's fast-paced, multiracial, pragmatic innovation environment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-blue-400 uppercase">1. Harmony (Wa) & Collectivism</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">IDV Dimension</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Prioritize collective celebration, community solidarity, and multi-ethnic warmth. Celebrate team milestones rather than self-aggrandizing claims.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-amber-400 uppercase">2. Uncertainty Avoidance & Precision</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">UAI Dimension</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ensure zero tech exaggeration. Always pair frontier technology insights with proven reliability, trust, and practical utility.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-emerald-400 uppercase">3. Long-Term Orientation (Kaizen)</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">LTO Dimension</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Position continuous learning, sustainability, and workforce future-readiness as enduring commitments, not passing fads.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-purple-400 uppercase">4. Pragmatic Action & Innovation</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">SG Execution</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Highlight direct productivity breakthroughs and time savings for Brother Singapore staff and local clients.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 3: Editorial Style Guide */}
      {activeSubTab === 'style-guide' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white">Brother Singapore Editorial Standards & Voice</h3>
            <p className="text-xs text-slate-400 mt-1">Core rules baked into all system prompts.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-2">The Scroll-Stopping Hook</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Must deliver immediate emotional or intellectual payoff in the first 120 characters before the "...see more" truncation.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-2">Paragraph Rhythm</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Max 1–2 sentences per paragraph block. Generous line spacing for optimal mobile readability.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-2">Mandatory Hashtag Set</span>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                #BrotherSingapore #AtYourSide #BrotherX
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
