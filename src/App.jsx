import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage.jsx';
import BrotherHeader from './components/BrotherHeader.jsx';
import Sidebar from './components/Sidebar.jsx';
import HomeFeedAnalytics from './components/HomeFeedAnalytics.jsx';
import Module1EventPosts from './components/Module1EventPosts.jsx';
import Module2AIPosts from './components/Module2AIPosts.jsx';
import TemplateIngestionStudio from './components/TemplateIngestionStudio.jsx';
import DraftMediaStudio from './components/DraftMediaStudio.jsx';
import NotionDatabaseHub from './components/NotionDatabaseHub.jsx';
import TeamView from './components/TeamView.jsx';
import SettingsView from './components/SettingsView.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); 
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [draftStudioPayload, setDraftStudioPayload] = useState({ content: '', title: '' });

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
    const saved = localStorage.getItem('linkedusin_user');
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
    return !!localStorage.getItem('linkedusin_user');
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
      localStorage.setItem('linkedusin_user', JSON.stringify(user));
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('linkedusin_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    localStorage.removeItem('linkedusin_user');
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const handleNavigateToDraftStudio = (content, title) => {
    setDraftStudioPayload({ content, title });
    setActiveTab('draft-studio');
  };

  const handleSelectTemplateForDrafting = (template) => {
    setDraftStudioPayload({
      content: template.examplePost,
      title: `Campaign: ${template.name}`
    });
    setActiveTab('draft-studio');
  };

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
    <div className={`min-h-screen flex flex-col font-['Plus_Jakarta_Sans',sans-serif] overflow-x-hidden ${
      isDark ? 'bg-[#090D16] text-slate-100' : 'bg-[#F4F6F9] text-slate-900'
    }`}>
      {/* Official Brother Singapore Header */}
      <BrotherHeader
        isDark={isDark}
        setIsDark={setIsDark}
        currentUser={currentUser}
        onLogout={handleLogout}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main App Layout: Left Sidebar + Dynamic Main Workspace */}
      <div className="flex-1 flex max-w-[1536px] w-full mx-auto relative">
        {/* Responsive Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isDark={isDark}
          setIsDark={setIsDark}
          onLogout={handleLogout}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Dynamic Main Workspace Content */}
        <main className={`flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-56px)] sm:max-h-[calc(100vh-64px)] pb-20 lg:pb-8 custom-scrollbar ${
          isDark ? 'bg-[#090D16]' : 'bg-[#F4F6F9]'
        }`}>
          {activeTab === 'home' && (
            <HomeFeedAnalytics
              isDark={isDark}
              onNavigateToModule={(mod) => setActiveTab(mod)}
            />
          )}

          {activeTab === 'module-1' && (
            <Module1EventPosts isDark={isDark} />
          )}

          {activeTab === 'module-2' && (
            <Module2AIPosts
              isDark={isDark}
              onNavigateToDraftStudio={handleNavigateToDraftStudio}
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
            />
          )}

          {activeTab === 'notion-hub' && (
            <NotionDatabaseHub isDark={isDark} />
          )}

          {activeTab === 'team' && (
            <TeamView isDark={isDark} />
          )}

          {activeTab === 'settings' && (
            <SettingsView isDark={isDark} />
          )}
        </main>
      </div>
    </div>
  );
}
