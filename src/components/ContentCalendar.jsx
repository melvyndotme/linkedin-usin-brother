import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight, 
  List, 
  Grid, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Edit3, 
  Send, 
  ExternalLink, 
  Sparkles, 
  RefreshCw, 
  Image as ImageIcon, 
  X, 
  Filter,
  Check,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { safeGetItem, safeSetItem } from '../lib/storage.js';
import { publishToLinkedInApi } from '../lib/linkedInApi.js';

const DEMO_CALENDAR_POSTS = [
  {
    id: "demo-post-1",
    pageId: "demo-1",
    title: "Deepavali Celebration & Community Harmony",
    status: "Scheduled",
    category: "Festivals & Celebrations",
    author: "Allan Cheng",
    scheduledDate: "2026-10-20T09:00:00",
    cleanImageUrl: "",
    compositeImageUrl: "",
    imageType: "Banner (1.91:1)",
    slideCount: 1,
    content: "Wishing all our colleagues, partners, and friends a radiant and joyous Deepavali! ✨ As Singapore illuminates with festive energy, we celebrate the triumph of light, hope, and community unity. #BrotherSingapore #Deepavali2026 #AtYourSide",
    urn: "urn:buffer:post:demo-1"
  },
  {
    id: "demo-post-2",
    pageId: "demo-2",
    title: "Flexible Work Arrangements (FWA) & Kaizen",
    status: "Working Draft",
    category: "Thought Leadership",
    author: "Chloe Lee",
    scheduledDate: "2026-10-24T14:30:00",
    cleanImageUrl: "",
    compositeImageUrl: "",
    imageType: "Carousel (1:1)",
    slideCount: 5,
    content: "Sustainable performance requires space to breathe. At Brother Singapore, our Flexible Fridays approach empowers our team to focus without distraction and recharge for long-term excellence. #LifeAtBrother #WorkLifeHarmony",
    urn: ""
  },
  {
    id: "demo-post-3",
    pageId: "demo-3",
    title: "Brother SG E-Waste Drive & Green Plan 2030",
    status: "Scheduled",
    category: "Sustainability & ESG",
    author: "Melvyn Tan",
    scheduledDate: "2026-10-28T10:00:00",
    cleanImageUrl: "",
    compositeImageUrl: "",
    imageType: "Carousel (1:1)",
    slideCount: 5,
    content: "Every toner cartridge responsibly recycled brings us one step closer to Singapore's Green Plan 2030. Join Brother Singapore's community eco-drive this month. 🌿 #BrotherEarth #GreenPlan2030",
    urn: "urn:buffer:post:demo-3"
  }
];

export default function ContentCalendar({ isDark = false, onNavigateToStudio }) {
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week' | 'list'
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1)); // Default to October 2026
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Edit / Modal State
  const [selectedPost, setSelectedPost] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editScheduledDate, setEditScheduledDate] = useState('');
  const [editStatus, setEditStatus] = useState('Scheduled');
  const [conflictWarning, setConflictWarning] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [publishActionLoading, setPublishActionLoading] = useState(false);
  const [publishSuccessMsg, setPublishSuccessMsg] = useState(null);

  // Fetch posts from Notion
  const fetchCalendarPosts = async () => {
    setLoading(true);
    setError(null);
    const token = safeGetItem('notion_token');
    const pageId = safeGetItem('notion_page_id');

    try {
      const res = await fetch('/api/notion/sync?action=get_calendar_posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_calendar_posts',
          apiKey: token || undefined,
          databaseId: pageId || undefined
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.posts) && data.posts.length > 0) {
          setPosts(data.posts);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Could not fetch live calendar posts from Notion, using cached/demo data:', e);
    }

    // Fallback to local storage or demo posts
    const savedLocal = safeGetItem('brother_calendar_posts');
    if (savedLocal) {
      try {
        const parsed = JSON.parse(savedLocal);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPosts(parsed);
          setLoading(false);
          return;
        }
      } catch (e) {}
    }

    setPosts(DEMO_CALENDAR_POSTS);
    setLoading(false);
  };

  useEffect(() => {
    fetchCalendarPosts();
  }, []);

  // Save posts locally whenever they change
  useEffect(() => {
    if (posts.length > 0) {
      safeSetItem('brother_calendar_posts', JSON.stringify(posts));
    }
  }, [posts]);

  // Navigate calendar dates
  const handlePrev = () => {
    setCurrentDate(prev => {
      if (viewMode === 'month') {
        return new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
      } else if (viewMode === 'week') {
        const d = new Date(prev);
        d.setDate(d.getDate() - 7);
        return d;
      }
      return prev;
    });
  };

  const handleNext = () => {
    setCurrentDate(prev => {
      if (viewMode === 'month') {
        return new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
      } else if (viewMode === 'week') {
        const d = new Date(prev);
        d.setDate(d.getDate() + 7);
        return d;
      }
      return prev;
    });
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 9, 6)); // Target October 2026
  };

  const currentMonthYearStr = useMemo(() => {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [currentDate]);

  // Calendar Day Generation for Month View
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun
    const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // 0 is Mon
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Padding for previous month
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push({ dayNumber: null, isCurrentMonth: false, dateStr: null });
    }
    // Days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const dateStr = `${year}-${monthStr}-${dayStr}`;
      days.push({ dayNumber: day, isCurrentMonth: true, dateStr });
    }
    return days;
  }, [currentDate]);

  // Calendar Days for Week View (Mon - Sun)
  const weekDays = useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d);
    monday.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + i);
      const yyyy = dayDate.getFullYear();
      const mm = String(dayDate.getMonth() + 1).padStart(2, '0');
      const dd = String(dayDate.getDate()).padStart(2, '0');
      days.push({
        dayNumber: dayDate.getDate(),
        dateStr: `${yyyy}-${mm}-${dd}`,
        dayName: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
        fullDate: dayDate
      });
    }
    return days;
  }, [currentDate]);

  // Map posts by date string (YYYY-MM-DD)
  const postsByDate = useMemo(() => {
    const map = {};
    posts.forEach(post => {
      if (post.scheduledDate) {
        const dateKey = post.scheduledDate.slice(0, 10);
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push(post);
      }
    });
    return map;
  }, [posts]);

  // Open Edit Modal
  const openEditModal = (post) => {
    setSelectedPost(post);
    setEditTitle(post.title || '');
    setEditContent(post.content || '');
    setEditScheduledDate(post.scheduledDate ? post.scheduledDate.slice(0, 16) : '');
    setEditStatus(post.status || 'Scheduled');
    setConflictWarning(null);
    setPublishSuccessMsg(null);
  };

  // Real-time conflict validation when editing scheduled date
  const handleDateChange = (newDateStr) => {
    setEditScheduledDate(newDateStr);
    if (!newDateStr) {
      setConflictWarning(null);
      return;
    }

    const targetDay = newDateStr.slice(0, 10);
    const hasCollision = posts.some(p => {
      if (p.id === selectedPost?.id || p.pageId === selectedPost?.pageId) return false;
      return p.status === 'Scheduled' && p.scheduledDate && p.scheduledDate.slice(0, 10) === targetDay;
    });

    if (hasCollision) {
      setConflictWarning(`⚠️ A post is already scheduled for ${targetDay}. Only 1 post per day can be scheduled. Select a different date or use "1-Click Publish Now" to post immediately.`);
    } else {
      setConflictWarning(null);
    }
  };

  // Save Edit Handler
  const handleSaveEdit = async () => {
    if (!selectedPost) return;
    setSavingEdit(true);

    const updated = {
      ...selectedPost,
      title: editTitle,
      content: editContent,
      scheduledDate: editScheduledDate,
      status: editStatus
    };

    // Update locally
    setPosts(prev => prev.map(p => (p.id === selectedPost.id || p.pageId === selectedPost.pageId ? updated : p)));

    // Sync to Notion if pageId is present
    if (selectedPost.pageId) {
      const token = safeGetItem('notion_token');
      try {
        await fetch('/api/notion/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update_post',
            pageId: selectedPost.pageId,
            apiKey: token || undefined,
            post: updated
          })
        });
      } catch (err) {
        console.warn('Could not sync update to Notion:', err);
      }
    }

    setSavingEdit(false);
    setSelectedPost(null);
  };

  // 1-Click Instant Publish Handler
  const handleInstantPublish = async () => {
    if (!selectedPost) return;
    setPublishActionLoading(true);

    try {
      const bufferKey = safeGetItem('buffer_api_key');
      const bufferChannel = safeGetItem('buffer_channel_id');
      const result = await publishToLinkedInApi({
        commentary: editContent || selectedPost.content,
        imageUrl: selectedPost.compositeImageUrl || selectedPost.cleanImageUrl || null,
        bufferApiKey: bufferKey,
        bufferChannelId: bufferChannel,
        override1ClickPublish: true,
        mode: 'shareNow'
      });

      if (result.success) {
        const publishedPost = {
          ...selectedPost,
          status: 'Published',
          urn: result.urn
        };
        setPosts(prev => prev.map(p => (p.id === selectedPost.id || p.pageId === selectedPost.pageId ? publishedPost : p)));
        setPublishSuccessMsg(`🎉 Successfully published live via Buffer! (URN: ${result.urn})`);
        setTimeout(() => {
          setSelectedPost(null);
          setPublishSuccessMsg(null);
        }, 1800);
      } else {
        alert(`Publishing failed: ${result.error || 'Unknown error'}`);
      }
    } catch (e) {
      alert(`Error publishing: ${e.message}`);
    } finally {
      setPublishActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Published':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'Scheduled':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'Working Draft':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'Generated Candidate':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-[#0f2ea2] dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Content Calendar</h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-[#0f2ea2] dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                1-Post / Day Policy
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage scheduled LinkedIn posts, monitor pipeline dates, and prevent audience fatigue.
            </p>
          </div>
        </div>

        {/* View Switcher & Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Navigation Controls */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={handlePrev}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold px-2.5 text-slate-800 dark:text-slate-200 min-w-32 text-center">
              {currentMonthYearStr}
            </span>
            <button
              onClick={handleNext}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleToday}
            className="text-xs font-semibold px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-all"
          >
            Today
          </button>

          {/* View Mode Buttons */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('month')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'month' 
                  ? 'bg-white dark:bg-slate-700 text-[#0f2ea2] dark:text-blue-400 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'week' 
                  ? 'bg-white dark:bg-slate-700 text-[#0f2ea2] dark:text-blue-400 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Week
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'list' 
                  ? 'bg-white dark:bg-slate-700 text-[#0f2ea2] dark:text-blue-400 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              List
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchCalendarPosts}
            disabled={loading}
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all disabled:opacity-50"
            title="Refresh from Notion"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Content Area based on View Mode */}
      {viewMode === 'month' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Day Headers (Mon - Sun) */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-center py-2.5">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid Cells */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-slate-800/60">
            {calendarDays.map((cell, idx) => {
              if (!cell.isCurrentMonth) {
                return (
                  <div key={`empty-${idx}`} className="min-h-28 p-2 bg-slate-50/40 dark:bg-slate-950/20" />
                );
              }

              const cellPosts = postsByDate[cell.dateStr] || [];
              const hasScheduled = cellPosts.some(p => p.status === 'Scheduled');

              return (
                <div
                  key={cell.dateStr}
                  className={`min-h-28 p-2 flex flex-col justify-between transition-colors hover:bg-blue-50/30 dark:hover:bg-blue-950/10 ${
                    hasScheduled ? 'bg-blue-50/15 dark:bg-blue-950/5' : ''
                  }`}
                >
                  {/* Date Header */}
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold ${
                      cell.dayNumber === 6 && currentDate.getMonth() === 9 
                        ? 'w-6 h-6 rounded-full bg-[#0f2ea2] text-white flex items-center justify-center' 
                        : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {cell.dayNumber}
                    </span>

                    {hasScheduled && (
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5" title="Daily Slot Booked">
                        <ShieldCheck className="w-3 h-3" />
                        1/1
                      </span>
                    )}
                  </div>

                  {/* Post Badges */}
                  <div className="space-y-1.5 flex-1">
                    {cellPosts.map(post => (
                      <div
                        key={post.id || post.pageId}
                        onClick={() => openEditModal(post)}
                        className={`p-1.5 rounded-lg border text-left cursor-pointer transition-all hover:scale-[1.02] shadow-2xs ${
                          post.status === 'Scheduled'
                            ? 'bg-blue-100/70 dark:bg-blue-950/70 border-blue-300 dark:border-blue-800 text-blue-900 dark:text-blue-100'
                            : post.status === 'Published'
                            ? 'bg-emerald-100/70 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                            : 'bg-amber-100/70 dark:bg-amber-950/70 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-100'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span className="truncate max-w-[80px]">
                            {post.scheduledDate ? post.scheduledDate.slice(11, 16) : 'Draft'}
                          </span>
                          <span className="text-[9px] uppercase tracking-wider opacity-80">
                            {post.status === 'Scheduled' ? 'Ready' : post.status}
                          </span>
                        </div>
                        <div className="text-[11px] font-semibold truncate leading-tight mt-0.5">
                          {post.title}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week View */}
      {viewMode === 'week' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
            {weekDays.map((day) => {
              const cellPosts = postsByDate[day.dateStr] || [];
              const hasScheduled = cellPosts.some(p => p.status === 'Scheduled');
              const isToday = day.dateStr === '2026-10-06';

              return (
                <div key={day.dateStr} className="min-h-[360px] p-3 flex flex-col justify-between hover:bg-blue-50/20 dark:hover:bg-blue-950/10 transition-colors">
                  <div>
                    {/* Day Header */}
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-[11px] font-bold uppercase text-slate-400 block">
                          {day.dayName}
                        </span>
                        <span className={`text-base font-bold ${
                          isToday ? 'text-[#0f2ea2] dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'
                        }`}>
                          {day.dayNumber} {day.fullDate.toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                      </div>
                      {hasScheduled ? (
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5" title="Daily Slot Booked">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          1/1
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">0/1</span>
                      )}
                    </div>

                    {/* Posts for this day */}
                    <div className="space-y-2">
                      {cellPosts.map(post => (
                        <div
                          key={post.id || post.pageId}
                          onClick={() => openEditModal(post)}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all hover:scale-[1.02] shadow-2xs space-y-1.5 ${
                            post.status === 'Scheduled'
                              ? 'bg-blue-50/80 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800/80 text-blue-900 dark:text-blue-100'
                              : post.status === 'Published'
                              ? 'bg-emerald-50/80 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-100'
                              : 'bg-amber-50/80 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-100'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-bold">
                            <span>{post.scheduledDate ? post.scheduledDate.slice(11, 16) : 'Draft'}</span>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-bold border ${getStatusBadge(post.status)}`}>
                              {post.status}
                            </span>
                          </div>
                          <div className="text-xs font-bold line-clamp-2 leading-tight">
                            {post.title}
                          </div>
                          {post.imageType && (
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                              <ImageIcon className="w-3 h-3" />
                              <span>{post.imageType} ({post.slideCount || 1}s)</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 text-center text-[10px] text-slate-400">
                    {cellPosts.length === 0 ? 'No posts scheduled' : `${cellPosts.length} post`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {posts.map(post => (
              <div 
                key={post.id || post.pageId}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-500">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusBadge(post.status)}`}>
                        {post.status}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {post.scheduledDate ? new Date(post.scheduledDate).toLocaleString('en-SG', { dateStyle: 'medium', timeStyle: 'short' }) : 'No date set'}
                      </span>
                      {post.category && (
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          • {post.category}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {post.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                      {post.content}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEditModal(post)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit Post
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit & Scheduling Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-6 space-y-5 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#0f2ea2] dark:text-blue-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Edit Scheduled Post
                </h3>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {publishSuccessMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                {publishSuccessMsg}
              </div>
            )}

            {conflictWarning && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {conflictWarning}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Post Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0f2ea2]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Scheduled Date & Time (Buffer API)
                  </label>
                  <input
                    type="datetime-local"
                    value={editScheduledDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0f2ea2]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Pipeline Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0f2ea2]"
                  >
                    <option value="Working Draft">Working Draft</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Published">Published</option>
                    <option value="Generated Candidate">Generated Candidate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  LinkedIn Post Content
                </label>
                <textarea
                  rows={5}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white font-normal focus:outline-hidden focus:ring-2 focus:ring-[#0f2ea2] leading-relaxed"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={handleInstantPublish}
                disabled={publishActionLoading}
                className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5" />
                {publishActionLoading ? 'Publishing...' : '1-Click Publish Now'}
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedPost(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={savingEdit || Boolean(conflictWarning)}
                  className="px-5 py-2.5 bg-[#0f2ea2] hover:bg-[#0c2482] text-white rounded-xl text-xs font-bold transition-all shadow-md disabled:opacity-50"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
