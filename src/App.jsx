import React, { useState, useEffect, Component } from 'react';
import LoginPage from './components/LoginPage.jsx';
import BrotherHeader from './components/BrotherHeader.jsx';
import Sidebar from './components/Sidebar.jsx';
import HomeFeedAnalytics from './components/HomeFeedAnalytics.jsx';
import Module1EventPosts from './components/Module1EventPosts.jsx';
import Module2AIPosts from './components/Module2AIPosts.jsx';
import TemplateIngestionStudio from './components/TemplateIngestionStudio.jsx';
import DraftMediaStudio from './components/DraftMediaStudio.jsx';
import NotionDatabaseHub from './components/NotionDatabaseHub.jsx';
import ContentCalendar from './components/ContentCalendar.jsx';
import TeamView from './components/TeamView.jsx';
import SettingsView from './components/SettingsView.jsx';
import ProfileView from './components/ProfileView.jsx';
import PWAInstallPrompt from './components/PWAInstallPrompt.jsx';
import { safeGetItem, safeSetItem, safeRemoveItem } from './lib/storage.js';
import { logActivity } from './lib/auditLogger.js';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Workspace render error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 max-w-xl mx-auto mt-12 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto text-xl font-bold">
            ⚠️
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Workspace Temporarily Interrupted
          </h3>
          <p className="text-xs text-slate-500 font-mono bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
            {this.state.error?.message || 'Rendering error occurred.'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              if (this.props.onReset) this.props.onReset();
            }}
            className="bg-[#0f2ea2] hover:bg-[#0c2482] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all"
          >
            Reload Module
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const TAB_TO_PATH = {
  'home': '/',
  'module-1': '/events',
  'module-2': '/news',
  'draft-studio': '/studio',
  'calendar': '/calendar',
  'template-studio': '/templates',
  'notion-hub': '/notion',
  'team': '/team',
  'profile': '/profile',
  'settings': '/settings',
};

const PATH_TO_TAB = {
  '/': 'home',
  '/dashboard': 'home',
  '/events': 'module-1',
  '/module-1': 'module-1',
  '/news': 'module-2',
  '/trends': 'module-2',
  '/news-trends': 'module-2',
  '/module-2': 'module-2',
  '/studio': 'draft-studio',
  '/draft-studio': 'draft-studio',
  '/content-studio': 'draft-studio',
  '/calendar': 'calendar',
  '/templates': 'template-studio',
  '/template-studio': 'template-studio',
  '/notion': 'notion-hub',
  '/notion-hub': 'notion-hub',
  '/team': 'team',
  '/profile': 'profile',
  '/settings': 'settings',
  '/integrations': 'settings',
};

const TAB_TITLES = {
  'home': 'Executive Dashboard | Brother Singapore',
  'module-1': 'Events & Occasions | Brother Singapore',
  'module-2': 'News & Trends | Brother Singapore',
  'draft-studio': 'Content Studio | Brother Singapore',
  'calendar': 'Content Calendar | Brother Singapore',
  'template-studio': 'Templates Studio | Brother Singapore',
  'notion-hub': 'Notion Hub | Brother Singapore',
  'team': 'Team Directory | Brother Singapore',
  'profile': 'My Profile | Brother Singapore',
  'settings': 'Integrations & Settings | Brother Singapore',
};

function getTabFromLocation() {
  if (typeof window === 'undefined') return 'home';
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  if (PATH_TO_TAB[pathname]) {
    return PATH_TO_TAB[pathname];
  }
  const searchParams = new URLSearchParams(window.location.search);
  const tabParam = searchParams.get('tab') || searchParams.get('page');
  if (tabParam) {
    if (PATH_TO_TAB['/' + tabParam]) return PATH_TO_TAB['/' + tabParam];
    if (TAB_TO_PATH[tabParam]) return tabParam;
  }
  const hash = window.location.hash.replace(/^#\/?/, '').replace(/\/+$/, '');
  if (hash) {
    if (PATH_TO_TAB['/' + hash]) return PATH_TO_TAB['/' + hash];
    if (TAB_TO_PATH[hash]) return hash;
  }
  return 'home';
}

export default function App() {
  const [activeTab, setActiveTabState] = useState(() => getTabFromLocation());

  const setActiveTab = (tab, options = {}) => {
    const targetPath = TAB_TO_PATH[tab] || '/';
    const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
    
    if (options.replace) {
      window.history.replaceState({ tab }, '', targetPath);
    } else if (currentPath !== targetPath) {
      window.history.pushState({ tab }, '', targetPath);
    }
    
    if (TAB_TITLES[tab]) {
      document.title = TAB_TITLES[tab];
    }
    setActiveTabState(tab);
  };

  useEffect(() => {
    const handlePopState = () => {
      const tab = getTabFromLocation();
      setActiveTabState(tab);
      if (TAB_TITLES[tab]) {
        document.title = TAB_TITLES[tab];
      }
    };
    window.addEventListener('popstate', handlePopState);
    
    // Set initial document title and sync URL path if needed
    const initialTab = getTabFromLocation();
    if (TAB_TITLES[initialTab]) {
      document.title = TAB_TITLES[initialTab];
    }
    const targetPath = TAB_TO_PATH[initialTab];
    const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
    if (targetPath && targetPath !== '/' && currentPath === '/') {
      window.history.replaceState({ tab: initialTab }, '', targetPath);
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []); 
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return safeGetItem('brother_sidebar_collapsed') === 'true';
    } catch (e) {
      return false;
    }
  });

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      safeSetItem('brother_sidebar_collapsed', String(next));
      return next;
    });
  };

  const [draftStudioPayload, setDraftStudioPayload] = useState(() => {
    const saved = safeGetItem('brother_active_draft_payload');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.content || parsed.title)) return parsed;
      } catch (e) {}
    }
    return { content: '', title: '', occasion: null, activeDraft: null };
  });

  // Detect whether running as installed standalone PWA on mobile/desktop
  const isStandaloneApp = typeof window !== 'undefined' && (
    window.matchMedia('(display-mode: standalone)').matches || 
    window.navigator.standalone === true
  );

  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const email = params.get('email');
    if (email) {
      return {
        name: params.get('name') || email.split('@')[0],
        email: decodeURIComponent(email),
        role: params.get('role') || 'User'
      };
    }
    // When installed as standalone PWA, ensure login screen is required until explicitly authenticated in PWA
    if (isStandaloneApp && safeGetItem('pwa_authenticated') !== 'true') {
      return null;
    }
    const saved = safeGetItem('linkedusin_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('token') && params.get('email')) return true;
    if (isStandaloneApp && safeGetItem('pwa_authenticated') !== 'true') {
      return false;
    }
    return !!safeGetItem('linkedusin_user');
  });

  // Check URL query parameters for magic link authentication
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const email = params.get('email');
    const name = params.get('name');
    const role = params.get('role');

    if (token && email) {
      const user = {
        name: name || email.split('@')[0],
        email: decodeURIComponent(email),
        role: role || 'User'
      };
      setCurrentUser(user);
      setIsAuthenticated(true);
      safeSetItem('linkedusin_user', JSON.stringify(user));
      safeSetItem('pwa_authenticated', 'true');

      // Notify server session pool that token is verified (auto-authenticates waiting PWA in background!)
      fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, user })
      }).catch(() => {});

      logActivity({
        event: 'User Session Authenticated',
        category: 'Auth',
        details: `Signed in as ${user.name} (${user.role}) via magic link`,
        user
      });
      // Clean URL while keeping path
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Prefetch live team directory from Notion in background so TeamView is instantly ready
  useEffect(() => {
    async function prefetchTeam() {
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
        if (res.ok && data.success && Array.isArray(data.members) && data.members.length > 0) {
          safeSetItem('brother_team_cache', JSON.stringify(data.members));
        }
      } catch (e) {
        // Silent background prefetch
      }
    }
    prefetchTeam();
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    safeSetItem('linkedusin_user', JSON.stringify(user));
    safeSetItem('pwa_authenticated', 'true');
    logActivity({
      event: 'User Logged In',
      category: 'Auth',
      details: `Active session started for ${user.name} (${user.email})`,
      user
    });
  };

  const handleLogout = () => {
    if (currentUser) {
      logActivity({
        event: 'User Logged Out',
        category: 'Auth',
        details: `Session ended for ${currentUser.name} (${currentUser.email})`,
        user: currentUser
      });
    }
    safeRemoveItem('linkedusin_user');
    safeRemoveItem('pwa_authenticated');
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const handleUpdateProfile = (updatedUser) => {
    setCurrentUser(updatedUser);
    safeSetItem('linkedusin_user', JSON.stringify(updatedUser));
  };

  const handleNavigateToDraftStudio = (arg1, arg2) => {
    let payload = {};
    if (typeof arg1 === 'object' && arg1 !== null && arg1.content !== undefined) {
      payload = arg1;
    } else {
      payload = {
        content: arg1 || '',
        title: arg2 || 'LinkedIn Campaign',
        occasion: null,
        activeDraft: null
      };
    }
    setDraftStudioPayload(payload);
    safeSetItem('brother_active_draft_payload', JSON.stringify(payload));
    setActiveTab('draft-studio');
  };

  const handleSelectTemplateForDrafting = (template) => {
    const payload = {
      content: template.examplePost || '',
      title: `Campaign: ${template.name}`,
      occasion: {
        id: `template-${template.id || Date.now()}`,
        name: template.name,
        subtitle: template.category || 'Benchmark Template',
        category: template.category || 'Templates',
        eventType: 'corporate',
        theme: 'blue',
        badgeText: template.name,
        details: template.examplePost || '',
        suggestedHashtags: ['#BrotherSingapore', '#AtYourSide', '#WorkplaceInnovation']
      },
      activeDraft: {
        id: `draft-${template.id || Date.now()}`,
        name: template.name,
        post: template.examplePost || '',
        postContent: template.examplePost || '',
        whyThisWorks: template.strategicRationale || template.description || 'Standard Brother Singapore benchmark template.'
      },
      availableDrafts: [
        {
          id: template.id || `draft-${template.id || Date.now()}`,
          name: template.name,
          category: template.category,
          whyThisWorks: template.strategicRationale || template.description,
          post: template.examplePost || '',
          postContent: template.examplePost || ''
        }
      ]
    };
    handleNavigateToDraftStudio(payload);
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [isDark]);

  // If not authenticated, render the dedicated Login Screen
  if (!isAuthenticated || !currentUser) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        isDark={isDark}
      />
    );
  }

  return (
    <div className={`h-full h-[100dvh] w-full flex font-['Plus_Jakarta_Sans',sans-serif] overflow-hidden select-none ${
      isDark ? 'bg-[#090D16] text-slate-100' : 'bg-[#F4F6F9] text-slate-900'
    }`}>
      {/* Full-Height Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDark={isDark}
        setIsDark={setIsDark}
        currentUser={currentUser}
        onLogout={handleLogout}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        sidebarCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapsed}
      />

      {/* Main Column: Top Breadcrumb Bar + Dynamic Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Sendpilot-Style Top Header Bar */}
        <BrotherHeader
          isDark={isDark}
          setIsDark={setIsDark}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          sidebarCollapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapsed}
        />

        {/* Dynamic Main Workspace Content */}
        <main className={`flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto custom-scrollbar ${
          isDark ? 'bg-[#090D16]' : 'bg-[#F4F6F9]'
        }`}>
          <ErrorBoundary key={activeTab} onReset={() => setActiveTab('home')}>
            {activeTab === 'home' && (
              <HomeFeedAnalytics
                isDark={isDark}
                onNavigateToModule={(mod) => setActiveTab(mod)}
                onSelectTemplateForDrafting={handleSelectTemplateForDrafting}
              />
            )}

            {activeTab === 'module-1' && (
              <Module1EventPosts
                isDark={isDark}
                onNavigateToDraftStudio={handleNavigateToDraftStudio}
              />
            )}

            {activeTab === 'module-2' && (
              <Module2AIPosts
                isDark={isDark}
                onNavigateToDraftStudio={handleNavigateToDraftStudio}
                onNavigateToSettings={() => setActiveTab('settings')}
              />
            )}

            {activeTab === 'template-studio' && (
              <TemplateIngestionStudio
                isDark={isDark}
                onSelectTemplateForDrafting={handleSelectTemplateForDrafting}
              />
            )}

            {activeTab === 'draft-studio' && (
              <DraftMediaStudio
                isDark={isDark}
                initialContent={draftStudioPayload.content}
                initialTitle={draftStudioPayload.title}
                initialOccasion={draftStudioPayload.occasion}
                initialDraft={draftStudioPayload.activeDraft}
                initialAvailableDrafts={draftStudioPayload.availableDrafts}
                onNavigateToSettings={() => setActiveTab('settings')}
              />
            )}

            {activeTab === 'calendar' && (
              <ContentCalendar
                isDark={isDark}
                onNavigateToStudio={handleNavigateToDraftStudio}
              />
            )}

            {activeTab === 'notion-hub' && (
              <NotionDatabaseHub isDark={isDark} />
            )}

            {activeTab === 'team' && (
              <TeamView
                isDark={isDark}
                currentUser={currentUser}
                onNavigateToProfile={() => setActiveTab('profile')}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileView
                isDark={isDark}
                currentUser={currentUser}
                onUpdateProfile={handleUpdateProfile}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView isDark={isDark} />
            )}
          </ErrorBoundary>
        </main>
      </div>

      {/* PWA Home Screen Installation Prompt & Guide */}
      <PWAInstallPrompt isDark={isDark} />
    </div>
  );
}
