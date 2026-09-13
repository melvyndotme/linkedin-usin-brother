import React, { useState } from 'react';
import { Edit3, Image as ImageIcon, Video, Send, CheckCircle2, Copy, Check, Upload, Trash2, Eye, Sparkles, Layers, ShieldCheck, ChevronLeft, ChevronRight, AlertCircle, Database, ExternalLink } from 'lucide-react';
import NotionIcon from './icons/NotionIcon.jsx';
import { generateBrotherWebsiteBannerSVG } from '../lib/svgBrotherWebsiteTemplates.js';
import { publishToLinkedInApi, cleanLinkedInOrgId } from '../lib/linkedInApi.js';
import { safeGetItem } from '../lib/storage.js';

export default function DraftMediaStudio({ isDark, initialContent, initialTitle, onNavigateToSettings }) {
  const [title, setTitle] = useState(initialTitle || 'Singapore National Day 2026 Celebration');
  const [content, setContent] = useState(initialContent || `Happy 61st Singapore National Day! 🇸🇬✨

From humble beginnings to a global powerhouse of smart-nation innovation, we stand 'At your side' empowering businesses and communities across Singapore.

At Brother Singapore, our commitment goes beyond hardware — it is about honoring the resilient, multicultural fabric that makes our island nation vibrant and forward-looking.

Thank you to our dedicated team, partners, and clients who inspire us every single day. Majulah Singapura! 🎉

To everyone celebrating, how is your team marking this special day? Share your favorite traditions below! 👇

#BrotherSingapore #NDP2026 #NationalDay2026 #MajulahSingapura #AtYourSide #WorkplaceInnovation`);

  const [copied, setCopied] = useState(false);
  const [mediaType, setMediaType] = useState('banner'); // 'banner', 'images', 'video'
  const [uploadedImages, setUploadedImages] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [videoFile, setVideoFile] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [publishedData, setPublishedData] = useState(null);
  const [publishError, setPublishError] = useState(null);
  const [notionSaving, setNotionSaving] = useState(false);
  const [notionSavedData, setNotionSavedData] = useState(null);
  const [notionError, setNotionError] = useState(null);

  const bannerSvg = generateBrotherWebsiteBannerSVG({
    badgeText: "Celebrate SG 61",
    headline: "Singapore National Day",
    subtitle: "Majulah Singapura • Honoring 61 years of unity & innovation",
    theme: "national-day"
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => URL.createObjectURL(file));
    setUploadedImages([...uploadedImages, ...newImages]);
    setMediaType('images');
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile({
        name: file.name,
        url: URL.createObjectURL(file)
      });
      setMediaType('video');
    }
  };

  const handleSaveToNotionRepository = async (passedUrn = null) => {
    const token = safeGetItem('notion_token');
    const explicitDb = safeGetItem('notion_database_id') || '3c701136de4881de9d29ca4ea415e856';

    setNotionSaving(true);
    setNotionError(null);

    const postPayload = {
      title: title || 'Brother Singapore Official Post',
      content: content,
      category: 'AI & Employer Branding',
      status: 'Published',
      author: 'Allan Cheng',
      date: new Date().toISOString().split('T')[0],
      urn: passedUrn || publishedData?.urn || `urn:li:share:${Math.floor(100000000 + Math.random() * 900000000)}`,
      impressions: 0,
      likes: 0,
      comments: 0,
      reposts: 0,
      engagementRate: '0.0%'
    };

    try {
      const res = await fetch('/api/notion/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: token,
          databaseId: explicitDb,
          post: postPayload
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotionSavedData({
          url: data.url,
          message: 'Saved to Notion Enterprise Repository'
        });
      } else {
        setNotionError(data.error || 'Failed to archive in Notion');
      }
    } catch (e) {
      setNotionError(e.message);
    } finally {
      setNotionSaving(false);
    }
  };

  const handlePublishToLinkedIn = async () => {
    setPublishing(true);
    setPublishError(null);
    const token = safeGetItem('key_linkedin');
    const orgId = safeGetItem('linkedin_org_id') || '96363282';

    try {
      const result = await publishToLinkedInApi({ commentary: content, orgId, token: token || undefined });
      if (result && result.success) {
        setPublishing(false);
        setPublishError(null);
        setPublishedData({
          urn: result.urn,
          status: 'Live on LinkedIn',
          isLive: true,
          publishedAt: result.publishedAt || new Date().toLocaleTimeString(),
          notionStatus: 'Synced to Notion Repository',
          postUrl: result.urn ? `https://www.linkedin.com/feed/update/${result.urn}` : null
        });
        handleSaveToNotionRepository(result.urn);
        return;
      } else {
        setPublishing(false);
        setPublishError({
          message: result?.error || 'LinkedIn API returned an error. Ensure your OAuth 2.0 token with w_organization_social scope is configured.',
          needsToken: !token
        });
      }
    } catch (err) {
      setPublishing(false);
      setPublishError({
        message: err.message || 'Network error connecting to LinkedIn publishing API.',
        needsToken: !token
      });
    }
  };

  const handleSimulatePublish = () => {
    setPublishing(true);
    setPublishError(null);
    setTimeout(() => {
      const mockUrn = `urn:li:share:${Math.floor(100000000 + Math.random() * 900000000)}`;
      setPublishing(false);
      setPublishedData({
        urn: mockUrn,
        status: 'Simulated Broadcast (Sandbox)',
        isLive: false,
        publishedAt: new Date().toLocaleTimeString(),
        notionStatus: 'Synced to Notion Repository'
      });
      handleSaveToNotionRepository(mockUrn);
    }, 800);
  };

  // LinkedIn mobile fold character threshold (~140 chars)
  const foldCharLimit = 140;
  const isOverFold = content.length > foldCharLimit;
  const preFoldText = content.slice(0, foldCharLimit);
  const postFoldText = content.slice(foldCharLimit);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className={`p-4 sm:p-6 rounded-2xl border transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0f2ea2]/10 text-[#0f2ea2] dark:text-blue-400 text-[11px] font-bold uppercase tracking-wider mb-1 sm:mb-1.5">
              <Edit3 className="w-3.5 h-3.5" />
              Content Studio
            </div>
            <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Post & Media Editor
            </h2>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleSaveToNotionRepository()}
              disabled={notionSaving || Boolean(notionSavedData)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <NotionIcon className={`w-3.5 h-3.5 ${notionSaving ? 'animate-spin' : ''}`} />
              <span>{notionSaving ? 'Archiving...' : notionSavedData ? 'In Notion Repo' : 'Archive to Notion'}</span>
            </button>
            <button
              onClick={handlePublishToLinkedIn}
              disabled={publishing || (publishedData && publishedData.status === 'Live on LinkedIn')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer ${
                publishedData
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#0f2ea2] hover:bg-[#0c2482] text-white'
              }`}
            >
              {publishing ? (
                <Sparkles className="w-4 h-4 animate-spin" />
              ) : publishedData ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {publishing ? 'Connecting to LinkedIn...' : publishedData ? 'Published on LinkedIn!' : '1-Click Publish to LinkedIn'}
            </button>
          </div>
        </div>
      </div>

      {/* Publish Error / Missing Credentials Notice Banner */}
      {publishError && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/50 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 dark:text-amber-200">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">LinkedIn Live Publish Required Credentials</span>
              <p className="mt-0.5 opacity-90 leading-relaxed">{publishError.message}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            {onNavigateToSettings && (
              <button
                type="button"
                onClick={onNavigateToSettings}
                className="px-3.5 py-1.5 rounded-lg bg-[#0f2ea2] hover:bg-[#0c2482] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Configure in Integrations ↗
              </button>
            )}
            <button
              type="button"
              onClick={handleSimulatePublish}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-semibold hover:bg-amber-100/50 transition-all cursor-pointer"
            >
              Simulate Test Broadcast
            </button>
          </div>
        </div>
      )}

      {notionSavedData && (
        <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/30 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-blue-900 dark:text-blue-200">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#0f2ea2] dark:text-blue-400 shrink-0" />
            <div>
              <span className="font-bold">Archived to Notion Enterprise Repository!</span>
              <span className="text-[11px] opacity-80 ml-2">Permanent database record saved for analytics telemetry.</span>
            </div>
          </div>
          {notionSavedData.url && (
            <a
              href={notionSavedData.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0f2ea2] dark:text-blue-400 hover:underline shrink-0"
            >
              <span>View in Notion</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}

      {publishedData && (
        <div className={`p-4 rounded-xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          publishedData.isLive
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
            : 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-500/30 text-blue-900 dark:text-blue-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className={`w-5 h-5 shrink-0 ${publishedData.isLive ? 'text-emerald-500' : 'text-blue-500'}`} />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold">
                  {publishedData.isLive
                    ? 'Post is Live on Brother Singapore Company Page!'
                    : 'Simulated Broadcast (Sandbox Test Mode)'}
                </span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                  publishedData.isLive
                    ? 'bg-emerald-200/60 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-100'
                    : 'bg-blue-200/60 dark:bg-blue-900/80 text-blue-900 dark:text-blue-100'
                }`}>
                  {publishedData.isLive ? 'Live API Verified' : 'Test Sandbox'}
                </span>
              </div>
              <div className="font-mono text-[11px] opacity-80 mt-0.5">Post URN: {publishedData.urn} • {publishedData.notionStatus}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {publishedData.postUrl && (
              <a
                href={publishedData.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-300 hover:underline text-xs"
              >
                <span>View on LinkedIn</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg ${
              publishedData.isLive
                ? 'bg-emerald-100 dark:bg-emerald-900/60'
                : 'bg-blue-100 dark:bg-blue-900/60'
            }`}>
              Published at {publishedData.publishedAt}
            </span>
          </div>
        </div>
      )}

      {/* Editor & Media Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left: Text Editor & LinkedIn Fold Preview */}
        <div className="lg:col-span-7 space-y-4">
          <div className={`p-4 sm:p-6 rounded-2xl border space-y-4 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Post Subject / Campaign Name
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white focus:border-[#0f2ea2] focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Post Copy (Markdown & Formatting)
                </label>
                <div className="flex items-center gap-2 text-[11px] font-mono">
                  <span className="text-slate-400">{content.length} characters</span>
                  <span className="text-[#0f2ea2] dark:text-blue-400 font-bold">• {content.split(/\s+/).filter(Boolean).length} words</span>
                </div>
              </div>

              <textarea
                rows={11}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 font-mono text-xs leading-relaxed text-slate-900 dark:text-white focus:border-[#0f2ea2] focus:outline-none custom-scrollbar"
              />
            </div>

            {/* LinkedIn Mobile Fold Line Visualizer */}
            <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/30 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-[#0f2ea2] dark:text-blue-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  LinkedIn Mobile "...see more" Fold Line (First 140 Chars)
                </span>
                <span className="font-mono text-slate-500">
                  {Math.min(content.length, 140)} / 140
                </span>
              </div>
              <div className="text-xs text-slate-700 dark:text-slate-300 leading-snug font-sans">
                <span className="bg-blue-200/60 dark:bg-blue-900/60 font-semibold px-0.5 rounded">
                  {preFoldText}
                </span>
                {isOverFold && (
                  <span className="text-slate-400 italic">
                    {" "}[...see more fold line]{" "}
                    <span className="opacity-60">{postFoldText.slice(0, 40)}...</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Media Manager (Banner / Carousel Images / Video) */}
        <div className="lg:col-span-5 space-y-4">
          <div className={`p-4 sm:p-6 rounded-2xl border space-y-4 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Attached Media Asset
              </h3>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border dark:border-slate-800 text-[10px] font-bold">
                <button
                  onClick={() => setMediaType('banner')}
                  className={`px-2 py-1 rounded ${mediaType === 'banner' ? 'bg-[#0f2ea2] text-white' : 'text-slate-500'}`}
                >
                  Banner
                </button>
                <button
                  onClick={() => setMediaType('images')}
                  className={`px-2 py-1 rounded ${mediaType === 'images' ? 'bg-[#0f2ea2] text-white' : 'text-slate-500'}`}
                >
                  Images ({uploadedImages.length})
                </button>
                <button
                  onClick={() => setMediaType('video')}
                  className={`px-2 py-1 rounded ${mediaType === 'video' ? 'bg-[#0f2ea2] text-white' : 'text-slate-500'}`}
                >
                  Video
                </button>
              </div>
            </div>

            {/* Media Option 1: Auto-generated Brother Website Banner */}
            {mediaType === 'banner' && (
              <div className="space-y-2">
                <span className="text-[11px] text-slate-500 block">Auto-Rendered Brother SG Website Hero Graphic</span>
                <div className="w-full rounded-xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-800 bg-slate-950 flex items-center justify-center">
                  <div 
                    className="w-full aspect-[12/5] flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: bannerSvg }}
                  />
                </div>
              </div>
            )}

            {/* Media Option 2: Upload Multiple Carousel Images */}
            {mediaType === 'images' && (
              <div className="space-y-3">
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-xl p-4 text-center cursor-pointer relative bg-slate-50/50 dark:bg-slate-950/40">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <ImageIcon className="w-6 h-6 text-[#0f2ea2] mx-auto mb-1" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">+ Upload Multi-Image Carousel</p>
                  <p className="text-[10px] text-slate-400">Select up to 9 PNG/JPG images</p>
                </div>

                {uploadedImages.length > 0 && (
                  <div className="space-y-2">
                    <div className="relative rounded-xl overflow-hidden border aspect-[16/9] bg-slate-950 flex items-center justify-center">
                      <img
                        src={uploadedImages[activeImageIndex]}
                        alt={`Slide ${activeImageIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 right-2 bg-slate-950/80 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                        {activeImageIndex + 1} / {uploadedImages.length}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                      {uploadedImages.map((img, idx) => (
                        <div
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`w-12 h-12 rounded-lg border-2 overflow-hidden cursor-pointer shrink-0 ${
                            activeImageIndex === idx ? 'border-[#0f2ea2]' : 'border-transparent'
                          }`}
                        >
                          <img src={img} alt="thumb" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Media Option 3: Video Upload */}
            {mediaType === 'video' && (
              <div className="space-y-3">
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-xl p-4 text-center cursor-pointer relative bg-slate-50/50 dark:bg-slate-950/40">
                  <input
                    type="file"
                    accept="video/mp4, video/quicktime"
                    onChange={handleVideoUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Video className="w-6 h-6 text-[#0f2ea2] mx-auto mb-1" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {videoFile ? videoFile.name : '+ Upload MP4 / MOV Video'}
                  </p>
                  <p className="text-[10px] text-slate-400">Supports native LinkedIn video uploads</p>
                </div>

                {videoFile && (
                  <div className="rounded-xl overflow-hidden border bg-black">
                    <video src={videoFile.url} controls className="w-full max-h-48" />
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <div className="pt-2 flex items-center justify-between text-xs">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:hover:text-white font-semibold"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy All Text'}
              </button>
              <span className="text-[11px] text-slate-400 font-mono">Status: Ready for Review</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
