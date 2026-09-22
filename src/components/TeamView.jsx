import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Mail, 
  Award, 
  UserCheck, 
  RefreshCw, 
  ExternalLink,
  LayoutGrid,
  List,
  Edit3,
  User,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { safeGetItem, safeSetItem } from '../lib/storage.js';

export default function TeamView({ isDark, currentUser, onNavigateToProfile }) {
  // Load cached team members from previous Notion fetch (if available)
  const [teamMembers, setTeamMembers] = useState(() => {
    try {
      const cached = safeGetItem('brother_team_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) { /* ignore parse errors */ }
    return [];
  });
  const [loading, setLoading] = useState(() => {
    // If no cached members yet, show loading immediately
    const cached = safeGetItem('brother_team_cache');
    return !cached;
  });
  const [lastSynced, setLastSynced] = useState(null);
  const [viewMode, setViewMode] = useState(() => {
    return safeGetItem('brother_team_view_mode') || 'cards';
  });
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'department' | 'email'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'

  const handleSetViewMode = (mode) => {
    setViewMode(mode);
    safeSetItem('brother_team_view_mode', mode);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const sortedMembers = useMemo(() => {
    const seen = new Set();
    const unique = [];
    for (const member of teamMembers) {
      const key = (member.email || member.name || member.id || '').trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      unique.push(member);
    }

    return unique.sort((a, b) => {
      let aVal = (a[sortBy] || '').toString().toLowerCase();
      let bVal = (b[sortBy] || '').toString().toLowerCase();
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [teamMembers, sortBy, sortOrder]);

  const checkIsSelf = (member) => {
    if (!currentUser) return false;
    const userEmail = currentUser.email?.trim().toLowerCase();
    const userName = currentUser.name?.trim().toLowerCase();
    const memberEmail = member.email?.trim().toLowerCase();
    const memberName = member.name?.trim().toLowerCase();

    return (
      Boolean(userEmail && memberEmail && userEmail === memberEmail) ||
      Boolean(userName && memberName && userName === memberName)
    );
  };

  const fetchLiveTeam = async () => {
    setLoading(true);
    try {
      const notionKey = safeGetItem('notion_token') || safeGetItem('token_notion') || '';
      const res = await fetch('/api/notion/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: notionKey || undefined,
          databaseId: '3c701136de4881869782cd894c6126c5'
        })
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.members)) {
        const seen = new Set();
        const unique = data.members.filter((m) => {
          const key = (m.email || m.name || m.id || '').trim().toLowerCase();
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        if (unique.length > 0) {
          setTeamMembers(unique);
          // Cache for instant rendering on next visit
          try { safeSetItem('brother_team_cache', JSON.stringify(unique)); } catch (e) { /* quota */ }
        }
        setLastSynced(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (e) {
      console.warn('Error fetching live team members from Notion:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveTeam();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner with Controls */}
      <div className={`p-4 sm:p-6 rounded-2xl border transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0f2ea2]/10 text-[#0f2ea2] dark:text-blue-400 text-[11px] font-bold uppercase tracking-wider mb-1.5">
              <Users className="w-3.5 h-3.5" />
              Team
            </div>
            <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Team Members
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap self-start sm:self-center">
            {/* View Mode Toggle: Cards vs List */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
              <button
                type="button"
                onClick={() => handleSetViewMode('cards')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-white dark:bg-slate-900 text-[#0f2ea2] dark:text-white shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Cards View"
                aria-label="Cards View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                type="button"
                onClick={() => handleSetViewMode('list')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-900 text-[#0f2ea2] dark:text-white shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="List View"
                aria-label="List View"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>

            <a
              href="https://app.notion.com/p/brotherap/3c701136de4881869782cd894c6126c5?v=3c701136de488153b10a000c52f0cb21"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all shadow-sm"
            >
              <span>Notion</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            <button
              onClick={fetchLiveTeam}
              disabled={loading}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#0f2ea2] hover:bg-[#0c2482] text-white text-xs font-semibold shadow-sm hover:shadow transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Syncing...' : 'Sync'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && sortedMembers.length === 0 && (
        viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-16 bg-slate-100 dark:bg-slate-950/60 rounded-xl" />
                <div className="h-10 bg-slate-100 dark:bg-slate-950/60 rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className={`p-12 rounded-2xl border text-center ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <RefreshCw className="w-6 h-6 text-[#0f2ea2] dark:text-blue-400 animate-spin mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-500">Loading live team directory from Notion...</p>
          </div>
        )
      )}

      {/* Empty State */}
      {!loading && sortedMembers.length === 0 && (
        <div className={`p-12 rounded-2xl border text-center ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <Users className="w-10 h-10 text-slate-400 mx-auto mb-3 opacity-60" />
          <h3 className={`text-base font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>No Team Members Found</h3>
          <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
            Connect and sync with your Notion Team Directory database to load team members dynamically.
          </p>
          <button
            type="button"
            onClick={fetchLiveTeam}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0f2ea2] text-white text-xs font-semibold hover:bg-[#0c2482] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync from Notion</span>
          </button>
        </div>
      )}

      {/* 1. CARDS VIEW */}
      {viewMode === 'cards' && sortedMembers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedMembers.map((member) => {
            const isSelf = checkIsSelf(member);
            return (
              <div
                key={member.id}
                className={`p-6 rounded-2xl border transition-all ${
                  isSelf
                    ? 'border-blue-300 dark:border-blue-700 ring-2 ring-[#0f2ea2]/15 bg-gradient-to-b from-blue-50/25 to-transparent dark:from-blue-950/20 shadow-md'
                    : isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-12 h-12 rounded-2xl ${member.avatarBg} text-white font-black text-lg flex items-center justify-center shadow-md shrink-0`}>
                      {member.name.slice(0, 1)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {isSelf ? (
                          <button
                            type="button"
                            onClick={onNavigateToProfile}
                            className="text-base font-bold text-[#0f2ea2] dark:text-blue-400 hover:underline flex items-center gap-1.5 cursor-pointer text-left group"
                            title="Click to edit your profile"
                          >
                            <span>{member.name}</span>
                            <Edit3 className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ) : (
                          <h3 className={`text-base font-bold cursor-default select-text ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {member.name}
                          </h3>
                        )}

                        {isSelf && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#0f2ea2] dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            You
                          </span>
                        )}

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${member.badgeColor}`}>
                          {member.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{member.role}</p>
                    </div>
                  </div>

                  {isSelf && onNavigateToProfile && (
                    <button
                      type="button"
                      onClick={onNavigateToProfile}
                      className="px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 text-[#0f2ea2] dark:text-blue-300 text-[11px] font-bold transition-all border border-blue-200 dark:border-blue-800 flex items-center gap-1 shadow-2xs cursor-pointer shrink-0"
                      title="Edit your profile"
                    >
                      <span>Edit Profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="space-y-3 text-xs">
                  <div className={`p-3 rounded-xl ${isDark ? 'bg-slate-950/60' : 'bg-slate-50'} border border-slate-100 dark:border-slate-800`}>
                    <div className="text-[11px] font-bold text-slate-500 mb-1">Affiliation & Department:</div>
                    <div className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{member.department}</div>
                    <div className="text-slate-400 font-mono text-[10px] mt-0.5">{member.email}</div>
                  </div>

                  <div>
                    <span className="text-slate-400 font-bold text-[11px] block mb-1">Key Responsibilities:</span>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
                      {member.responsibilities}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-[11px]">
                    <span className="text-slate-500 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <strong>{member.stats?.approved ?? member.approvedCount ?? 0}</strong> drafts approved
                    </span>
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <strong>{member.stats?.pending ?? member.pendingCount ?? 0}</strong> pending review
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. LIST VIEW */}
      {viewMode === 'list' && sortedMembers.length > 0 && (
        <div className={`rounded-2xl border overflow-hidden shadow-sm transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`border-b text-[11px] font-bold uppercase tracking-wider select-none ${
                  isDark ? 'border-slate-800 bg-slate-950/40 text-slate-400' : 'border-slate-100 bg-slate-50/70 text-slate-500'
                }`}>
                  {/* Name Sortable Header */}
                  <th className="py-3 px-4 sm:px-6">
                    <button
                      type="button"
                      onClick={() => handleSort('name')}
                      className="inline-flex items-center gap-1.5 font-bold uppercase hover:text-[#0f2ea2] dark:hover:text-blue-400 transition-colors cursor-pointer"
                      title="Sort by Name"
                    >
                      <span>Team Member</span>
                      {sortBy === 'name' ? (
                        sortOrder === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-[#0f2ea2] dark:text-blue-400" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-[#0f2ea2] dark:text-blue-400" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                      )}
                    </button>
                  </th>

                  {/* Department Sortable Header */}
                  <th className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => handleSort('department')}
                      className="inline-flex items-center gap-1.5 font-bold uppercase hover:text-[#0f2ea2] dark:hover:text-blue-400 transition-colors cursor-pointer"
                      title="Sort by Department"
                    >
                      <span>Department</span>
                      {sortBy === 'department' ? (
                        sortOrder === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-[#0f2ea2] dark:text-blue-400" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-[#0f2ea2] dark:text-blue-400" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                      )}
                    </button>
                  </th>

                  {/* Email Sortable Header */}
                  <th className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => handleSort('email')}
                      className="inline-flex items-center gap-1.5 font-bold uppercase hover:text-[#0f2ea2] dark:hover:text-blue-400 transition-colors cursor-pointer"
                      title="Sort by Email"
                    >
                      <span>Email</span>
                      {sortBy === 'email' ? (
                        sortOrder === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-[#0f2ea2] dark:text-blue-400" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-[#0f2ea2] dark:text-blue-400" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                      )}
                    </button>
                  </th>

                  <th className="py-3 px-4">Role / Whitelist</th>
                  <th className="py-3 px-4">Activity</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {sortedMembers.map((member) => {
                  const isSelf = checkIsSelf(member);
                  return (
                    <tr 
                      key={member.id} 
                      className={`transition-colors ${
                        isSelf 
                          ? 'bg-blue-50/50 dark:bg-blue-950/25' 
                          : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Member Info */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl ${member.avatarBg} text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs`}>
                            {member.name.slice(0, 1)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              {isSelf ? (
                                <button
                                  type="button"
                                  onClick={onNavigateToProfile}
                                  className="font-bold text-sm text-[#0f2ea2] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer text-left"
                                  title="Click to edit your profile"
                                >
                                  <span>{member.name}</span>
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              ) : (
                                <span className={`font-bold text-sm cursor-default select-text ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                  {member.name}
                                </span>
                              )}
                              {isSelf && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-blue-100 text-[#0f2ea2] dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                              {member.role}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                          {member.department}
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-600 dark:text-slate-400 font-mono text-[11px] truncate max-w-[200px]">
                          {member.email}
                        </div>
                      </td>

                      {/* Role / Whitelist Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${member.badgeColor}`}>
                          {member.badge}
                        </span>
                      </td>

                      {/* Activity Stats */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3 text-[11px]">
                          <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1" title="Approved drafts">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <strong>{member.stats?.approved ?? member.approvedCount ?? 0}</strong>
                          </span>
                          <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1" title="Pending review">
                            <Clock className="w-3 h-3 text-amber-500" />
                            <strong>{member.stats?.pending ?? member.pendingCount ?? 0}</strong>
                          </span>
                        </div>
                      </td>

                      {/* Action Button */}
                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                        {isSelf ? (
                          <button
                            type="button"
                            onClick={onNavigateToProfile}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0f2ea2] hover:bg-[#0c2482] text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                            title="Edit your profile"
                          >
                            <span>Edit Profile</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-600 text-xs select-none">
                            View only
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
