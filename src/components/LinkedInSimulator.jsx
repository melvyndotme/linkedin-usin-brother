import React, { useState } from 'react';
import { ThumbsUp, MessageSquare, Repeat2, Send, Globe, MoreHorizontal, CheckCircle2, Copy, Check, Clock, ShieldCheck, Sparkles } from 'lucide-react';

export default function LinkedInSimulator({ previewData }) {
  const [approved, setApproved] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!previewData) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4">
        <Sparkles className="w-8 h-8 text-blue-400 mx-auto" />
        <h3 className="text-base font-bold text-white">No Post Selected for Preview</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Select any occasion in the <strong className="text-blue-300">Festive Engine</strong> or any news item in the <strong className="text-cyan-300">AI Intelligence Engine</strong> and click "Preview in LinkedIn Feed".
        </p>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(previewData.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Review Gate & Approval Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Human-in-the-Loop Review Gate</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {previewData.meta.template}
              </span>
            </div>
            <p className="text-xs text-slate-400">Reviewers: Allan Cheng (POD Lead) • Chloe Lee (HR)</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-700 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Text'}
          </button>
          <button
            onClick={() => setApproved(!approved)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
              approved
                ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                : 'bg-[#005BAC] hover:bg-[#004b8f] text-white shadow-blue-500/20'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {approved ? 'Approved for Scheduling' : 'Approve Draft'}
          </button>
        </div>
      </div>

      {/* Realistic LinkedIn Feed Card */}
      <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden font-sans">
        {/* Post Author Header */}
        <div className="p-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#005BAC] flex items-center justify-center text-white font-bold text-lg shadow-sm">
              B
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-sm text-slate-900 leading-tight">Brother Singapore</h4>
                <span className="text-[11px] text-slate-500 font-normal">• 1st</span>
              </div>
              <p className="text-xs text-slate-500 leading-tight mt-0.5">At your side • Electronics & Enterprise Automation</p>
              <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                <span>Just now</span>
                <span>•</span>
                <Globe className="w-3 h-3 text-slate-400" />
              </div>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-600 p-1">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Post Body */}
        <div className="px-4 pb-3 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
          {previewData.content}
        </div>

        {/* Rendered Visual Graphic */}
        {previewData.svgMarkup && (
          <div 
            className="w-full bg-slate-950 flex items-center justify-center border-t border-b border-slate-100 max-h-[380px] overflow-hidden"
            dangerouslySetInnerHTML={{ __html: previewData.svgMarkup }}
          />
        )}

        {/* Engagement Stats Bar */}
        <div className="px-4 py-2 flex items-center justify-between text-xs text-slate-500 border-b border-slate-100">
          <div className="flex items-center gap-1">
            <div className="flex -space-x-1">
              <span className="w-4 h-4 rounded-full bg-blue-500 text-[10px] text-white flex items-center justify-center">👍</span>
              <span className="w-4 h-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">❤️</span>
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-[10px] text-white flex items-center justify-center">👏</span>
            </div>
            <span className="ml-1 text-[11px]">84 • 12 comments</span>
          </div>
          <span className="text-[11px]">4 reposts</span>
        </div>

        {/* Action Buttons */}
        <div className="px-2 py-1 flex items-center justify-around text-slate-600 text-xs font-semibold">
          <button className="flex items-center gap-1.5 py-2.5 px-4 rounded-lg hover:bg-slate-100">
            <ThumbsUp className="w-4 h-4" />
            <span>Like</span>
          </button>
          <button className="flex items-center gap-1.5 py-2.5 px-4 rounded-lg hover:bg-slate-100">
            <MessageSquare className="w-4 h-4" />
            <span>Comment</span>
          </button>
          <button className="flex items-center gap-1.5 py-2.5 px-4 rounded-lg hover:bg-slate-100">
            <Repeat2 className="w-4 h-4" />
            <span>Repost</span>
          </button>
          <button className="flex items-center gap-1.5 py-2.5 px-4 rounded-lg hover:bg-slate-100">
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
