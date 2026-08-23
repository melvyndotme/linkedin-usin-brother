import React, { useState } from 'react';
import { Palette, Download, Copy, Check, Code, RefreshCw, Sparkles, Layers } from 'lucide-react';
import { generateFestiveSVG, generateInnovationInfographicSVG } from '../lib/svgGenerator.js';

export default function SVGStudio() {
  const [activeType, setActiveType] = useState('infographic'); // 'infographic' or 'festive'
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);

  // Infographic state
  const [topic, setTopic] = useState('Autonomous Agentic AI in Enterprise');
  const [pillar1, setPillar1] = useState('Autonomous Task Orchestration');
  const [pillar1Desc, setPillar1Desc] = useState('Multi-agent systems executing complex cross-department workflows.');
  const [pillar2, setPillar2] = useState('Workflow Agility');
  const [pillar2Desc, setPillar2Desc] = useState('Reduces manual coordination by 65%, freeing teams for strategic focus.');
  const [pillar3, setPillar3] = useState('Brother SG Impact');
  const [pillar3Desc, setPillar3Desc] = useState('Empowers Brother Singapore staff to achieve breakthrough productivity.');

  // Festive state
  const [festiveTitle, setFestiveTitle] = useState('Singapore National Day');
  const [festiveSubtitle, setFestiveSubtitle] = useState('Celebrating unity, resilience, and forward progress together');
  const [festiveTheme, setFestiveTheme] = useState('national-red'); // 'national-red', 'festive-green', 'cny-red', 'deepavali-gold', 'brother-blue'

  const currentSvg = activeType === 'infographic' 
    ? generateInnovationInfographicSVG({
        topic,
        pillar1,
        pillar1Desc,
        pillar2,
        pillar2Desc,
        pillar3,
        pillar3Desc,
        source: 'Brother Xplorer Intelligence'
      })
    : generateFestiveSVG({
        title: festiveTitle,
        subtitle: festiveSubtitle,
        theme: festiveTheme,
        year: '2027'
      });

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSvg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brother-sg-${activeType}-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-blue-950/40 border border-indigo-500/20 rounded-2xl p-6 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Palette className="w-3.5 h-3.5" />
              Phase 3: Parametric SVG Asset & Infographic Studio
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Branded Social Visual Engine
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Generates vector graphics complying with Brother's design standards: Brother Blue (`#005BAC`), 
              geometric Kumiko accents, high contrast typography, and multi-tier infographics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs border border-slate-700 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy SVG'}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-[#005BAC] hover:bg-[#004b8f] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-blue-500/20 transition-all"
            >
              <Download className="w-4 h-4" />
              Download .SVG
            </button>
          </div>
        </div>
      </div>

      {/* Editor & Live Canvas Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            {/* Template Type Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">Template Format</label>
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setActiveType('infographic')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    activeType === 'infographic'
                      ? 'bg-[#005BAC] text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  3-Stage Infographic
                </button>
                <button
                  onClick={() => setActiveType('festive')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    activeType === 'festive'
                      ? 'bg-[#005BAC] text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Festive Greeting Card
                </button>
              </div>
            </div>

            {activeType === 'infographic' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Headline Topic</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-cyan-400 mb-1">01 | What It Is (Header & Detail)</label>
                  <input
                    type="text"
                    value={pillar1}
                    onChange={(e) => setPillar1(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white mb-1.5 focus:border-indigo-500 focus:outline-none"
                  />
                  <textarea
                    rows={2}
                    value={pillar1Desc}
                    onChange={(e) => setPillar1Desc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-blue-400 mb-1">02 | Why It Matters (Header & Detail)</label>
                  <input
                    type="text"
                    value={pillar2}
                    onChange={(e) => setPillar2(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white mb-1.5 focus:border-indigo-500 focus:outline-none"
                  />
                  <textarea
                    rows={2}
                    value={pillar2Desc}
                    onChange={(e) => setPillar2Desc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-emerald-400 mb-1">03 | Brother SG Impact (Header & Detail)</label>
                  <input
                    type="text"
                    value={pillar3}
                    onChange={(e) => setPillar3(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white mb-1.5 focus:border-indigo-500 focus:outline-none"
                  />
                  <textarea
                    rows={2}
                    value={pillar3Desc}
                    onChange={(e) => setPillar3Desc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Festive Title</label>
                  <input
                    type="text"
                    value={festiveTitle}
                    onChange={(e) => setFestiveTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Subtitle / Greeting Message</label>
                  <textarea
                    rows={2}
                    value={festiveSubtitle}
                    onChange={(e) => setFestiveSubtitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Theme Palette</label>
                  <select
                    value={festiveTheme}
                    onChange={(e) => setFestiveTheme(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="national-red">Singapore National Red & White</option>
                    <option value="festive-green">Hari Raya Festive Emerald Green</option>
                    <option value="cny-red">Lunar New Year Crimson & Gold</option>
                    <option value="deepavali-gold">Deepavali Warm Amber & Gold</option>
                    <option value="brother-blue">Brother Signature Blue & Cyan</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Canvas / Preview Column */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Live 1200×630 Vector Preview
              </h3>
              <button
                onClick={() => setShowCode(!showCode)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-mono flex items-center gap-1"
              >
                <Code className="w-3.5 h-3.5" />
                {showCode ? 'View Render' : 'View SVG Markup'}
              </button>
            </div>

            {showCode ? (
              <pre className="bg-slate-950 border border-slate-800 rounded-xl p-5 font-mono text-xs text-slate-300 overflow-x-auto max-h-[480px] custom-scrollbar">
                {currentSvg}
              </pre>
            ) : (
              <div 
                className="w-full rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 flex items-center justify-center min-h-[380px]"
                dangerouslySetInnerHTML={{ __html: currentSvg }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
