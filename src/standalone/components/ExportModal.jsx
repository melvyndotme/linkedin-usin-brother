import React, { useState } from 'react';
import { X, Download, FileText, Code2, Check, Copy } from 'lucide-react';

export default function ExportModal({ isOpen, onClose, data, isDark }) {
  const [copiedJson, setCopiedJson] = useState(false);

  if (!isOpen || !data) return null;

  const downloadCSV = () => {
    if (!data.ads || data.ads.length === 0) return;

    const headers = [
      'Ad ID',
      'Advertiser',
      'Status',
      'Started Date',
      'Format',
      'Target Countries',
      'Headline',
      'Primary Text',
      'CTA Text',
      'CTA Destination URL',
      'Campaign Theme'
    ];

    const rows = data.ads.map(ad => [
      `"${ad.id}"`,
      `"${data.advertiser.name}"`,
      `"${ad.status}"`,
      `"${ad.startedDate}"`,
      `"${ad.format}"`,
      `"${(ad.targeting || []).join(',')}"`,
      `"${(ad.headline || '').replace(/"/g, '""')}"`,
      `"${(ad.primaryText || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      `"${ad.ctaText || ''}"`,
      `"${ad.ctaUrl || ''}"`,
      `"${ad.campaignType || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `linkedin-ads-${data.advertiser.handle || 'competitor'}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl relative transition-all ${
        isDark ? 'bg-[#111625] border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold">Export Extracted Ads Data</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Export {data.ads.length} active ads for <strong>{data.advertiser.name}</strong>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
          {/* CSV Download */}
          <button
            type="button"
            onClick={downloadCSV}
            className="flex flex-col items-center justify-center p-5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#0A66C2] dark:hover:border-[#0A66C2] bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm">Download as CSV</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Spreadsheet ready (.csv)</span>
          </button>

          {/* JSON Copy */}
          <button
            type="button"
            onClick={copyJSON}
            className="flex flex-col items-center justify-center p-5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#0A66C2] dark:hover:border-[#0A66C2] bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-blue-500/10 text-[#0A66C2] dark:text-blue-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              {copiedJson ? <Check className="w-5 h-5 text-emerald-500" /> : <Code2 className="w-5 h-5" />}
            </div>
            <span className="font-bold text-sm">{copiedJson ? 'Copied to Clipboard!' : 'Copy Raw JSON'}</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Structured API schema</span>
          </button>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
