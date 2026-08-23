import React, { useState } from 'react';
import BrotherHeader from './components/BrotherHeader.jsx';
import Sidebar from './components/Sidebar.jsx';
import HomeFeedAnalytics from './components/HomeFeedAnalytics.jsx';
import Module1EventPosts from './components/Module1EventPosts.jsx';
import Module2AIPosts from './components/Module2AIPosts.jsx';
import TeamView from './components/TeamView.jsx';
import SettingsView from './components/SettingsView.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'module-1', 'module-2', 'team', 'settings'
  const [isDark, setIsDark] = useState(false); // Default to clean Brother SG light website theme
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

  return (
    <div className={`min-h-screen flex flex-col font-['Plus_Jakarta_Sans',sans-serif] ${
      isDark ? 'bg-[#090D16] text-slate-100' : 'bg-[#F4F6F9] text-slate-900'
    }`}>
      {/* Official Brother Singapore Header */}
      <BrotherHeader
        isDark={isDark}
        setIsDark={setIsDark}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main App Layout: Left Sidebar + Content Area */}
      <div className="flex-1 flex max-w-[1536px] w-full mx-auto">
        {/* Left Sidebar Menu */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isDark={isDark}
          setIsDark={setIsDark}
          onLogout={handleLogout}
        />

        {/* Dynamic Main Workspace Content */}
        <main className={`flex-1 p-6 sm:p-8 overflow-y-auto max-h-[calc(100vh-64px)] custom-scrollbar ${
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
            <Module2AIPosts isDark={isDark} />
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
