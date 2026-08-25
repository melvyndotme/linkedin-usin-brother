import React, { useState } from 'react';
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
  const [isDark, setIsDark] = useState(false); // Default to clean Brother SG light theme
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [draftStudioPayload, setDraftStudioPayload] = useState({ content: '', title: '' });

  const [currentUser, setCurrentUser] = useState({
    name: 'Allan Cheng',
    role: 'Admin / POD Lead',
    email: 'allan.cheng@brother.com.sg'
  });

  const handleLogout = () => {
    // Switch between Allan and Chloe for easy prototype role demoing
    if (currentUser.name === 'Allan Cheng') {
      setCurrentUser({
        name: 'Chloe Lee',
        role: 'User (HR Lead)',
        email: 'chloe.lee@brother.com.sg'
      });
    } else {
      setCurrentUser({
        name: 'Allan Cheng',
        role: 'Admin (POD Lead)',
        email: 'allan.cheng@brother.com.sg'
      });
    }
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
        {/* Responsive Sidebar (Drawer on mobile, persistent on desktop) */}
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
