import React, { useState, createContext, useContext } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TaskProvider } from './contexts/TaskContext';
import { TimerProvider } from './contexts/TimerContext';
import { StatisticsProvider } from './contexts/StatisticsContext';
import { GamificationProvider } from './contexts/GamificationContext';
import AuthWrapper from './components/Auth/AuthWrapper';
import TaskManagement from './components/Tasks/TaskManagement';
import PomodoroTimer from './components/Timer/PomodoroTimer';
import Dashboard from './components/Dashboard/Dashboard';
import Settings from './components/Settings/Settings';
import Gamification from './components/Gamification/Gamification';
import GamificationSync from './components/Gamification/GamificationSync';
import { AchievementNotification } from './components/Notifications';
import BrowserInfo from './components/BrowserCompatibility/BrowserInfo';
import MetricsDebugger from './components/Debug/MetricsDebugger';

// Theme Context
const ThemeContext = createContext();

// Custom hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme Provider Component
const ThemeProvider = ({ children }) => {
  // Load theme preference from localStorage, default to dark mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('focusflow-theme');
      return savedTheme ? JSON.parse(savedTheme) : true; // Default to dark mode
    } catch (error) {
      console.error('Failed to load theme preference:', error);
      return true; // Default to dark mode on error
    }
  });

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newTheme = !prev;
      // Save theme preference to localStorage
      try {
        localStorage.setItem('focusflow-theme', JSON.stringify(newTheme));
      } catch (error) {
        console.error('Failed to save theme preference:', error);
      }
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <div className={isDarkMode ? 'dark' : ''}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

// Header Component
const Header = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700 transition-all duration-200 relative z-30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Mobile menu button and Logo */}
          <div className="flex items-center animate-fade-in-up">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-300 mr-3 focus-ring transform hover:scale-110 shadow-sm"
              aria-label="Toggle mobile menu"
            >
              <span className={`text-gray-700 dark:text-gray-300 text-xl transition-transform duration-300 ${
                isMobileMenuOpen ? 'rotate-90' : ''
              }`}>
                {isMobileMenuOpen ? '✕' : '☰'}
              </span>
            </button>
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent flex items-center space-x-2">
                <span className="animate-bounce-gentle">🎯</span>
                <span>FocusFlow</span>
              </h1>
            </div>
          </div>

          {/* User Info and Controls */}
          <div className="flex items-center space-x-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {/* User Welcome */}
            <div className="hidden sm:block text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Welcome back,</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.profile?.firstName || user?.username || 'User'}
              </p>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-300 hover:scale-110 focus-ring shadow-sm group"
              aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
            >
              {isDarkMode ? (
                <span className="text-yellow-500 text-xl group-hover:animate-wiggle" role="img" aria-label="Light mode">☀️</span>
              ) : (
                <span className="text-gray-700 text-xl group-hover:animate-wiggle" role="img" aria-label="Dark mode">🌙</span>
              )}
            </button>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-3 rounded-xl bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 hover:from-red-200 hover:to-red-300 dark:hover:from-red-800/40 dark:hover:to-red-700/40 transition-all duration-300 hover:scale-110 focus-ring shadow-sm group"
              aria-label="Logout"
              title="Logout"
            >
              <span className="text-red-600 dark:text-red-400 text-xl group-hover:animate-wiggle" role="img" aria-label="Logout">🚪</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

// Sidebar Component
const Sidebar = ({ activeSection, setActiveSection, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const menuItems = [
    { id: 'timer', name: 'Pomodoro Timer', icon: '⏱️' },
    { id: 'tasks', name: 'Task Management', icon: '📝' },
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'gamification', name: 'Achievements', icon: '🏆' },
    { id: 'settings', name: 'Settings', icon: '⚙️' },
  ];

  const handleMenuClick = (sectionId) => {
    setActiveSection(sectionId);
    setIsMobileMenuOpen(false); // Close mobile menu when item is selected
  };

  return (
    <>
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-xl border-r border-gray-200 dark:border-gray-700 transition-all duration-300 transform backdrop-blur-sm
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <nav className="mt-8 custom-scrollbar overflow-y-auto h-full">
          <div className="px-4">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6 flex items-center space-x-2">
              <span className="w-8 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></span>
              <span>Navigation</span>
            </h2>
            <ul className="space-y-3">
              {menuItems.map((item, index) => (
                <li key={item.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <button
                    onClick={() => handleMenuClick(item.id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 focus-ring group relative overflow-hidden ${
                      activeSection === item.id
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:scale-105 hover:shadow-md'
                    }`}
                    aria-current={activeSection === item.id ? 'page' : undefined}
                  >
                    {/* Background glow effect for active item */}
                    {activeSection === item.id && (
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 opacity-20 blur-xl"></div>
                    )}

                    <span className={`mr-3 text-lg transition-transform duration-300 relative z-10 ${
                      activeSection === item.id ? 'animate-bounce-gentle' : 'group-hover:scale-110'
                    }`} role="img" aria-hidden="true">
                      {item.icon}
                    </span>
                    <span className="relative z-10">{item.name}</span>

                    {/* Active indicator */}
                    {activeSection === item.id && (
                      <div className="absolute right-2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </aside>
    </>
  );
};

// PomodoroTimer component is now imported from components/Timer/PomodoroTimer.js

// TaskManagement component is now imported from components/Tasks/TaskManagement.js

// Dashboard component is now imported from components/Dashboard/Dashboard.js

// Settings component is now imported from components/Settings/Settings.js

// Main Content Component
const MainContent = ({ activeSection }) => {
  const renderContent = () => {
    switch (activeSection) {
      case 'timer':
        return <PomodoroTimer />;
      case 'tasks':
        return <TaskManagement />;
      case 'dashboard':
        return <Dashboard />;
      case 'gamification':
        return <Gamification />;
      case 'settings':
        return <Settings />;
      default:
        return <PomodoroTimer />;
    }
  };

  return (
    <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-all duration-300 custom-scrollbar lg:ml-0 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/10 dark:to-purple-900/10 rounded-full transform translate-x-48 -translate-y-48 opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-blue-100 to-cyan-100 dark:from-blue-900/10 dark:to-cyan-900/10 rounded-full transform -translate-x-40 translate-y-40 opacity-30"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 relative z-10">
        <div className="animate-fade-in-up">
          {renderContent()}
        </div>
      </div>
    </main>
  );
};

// Main App Component
function App() {
  const [activeSection, setActiveSection] = useState('timer');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <AuthProvider>
      <ThemeProvider>
        <AuthWrapper>
          <TaskProvider>
            <TimerProvider>
              <StatisticsProvider>
                <GamificationProvider>
                  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                    <GamificationSync />
                    <AchievementNotification />
                    <Header
                      isMobileMenuOpen={isMobileMenuOpen}
                      setIsMobileMenuOpen={setIsMobileMenuOpen}
                    />
                    <div className="flex h-[calc(100vh-4rem)]">
                      <Sidebar
                        activeSection={activeSection}
                        setActiveSection={setActiveSection}
                        isMobileMenuOpen={isMobileMenuOpen}
                        setIsMobileMenuOpen={setIsMobileMenuOpen}
                      />
                      <MainContent activeSection={activeSection} />

                      {/* Browser Compatibility Info */}
                      <BrowserInfo />

                      {/* Debug Tools (only in development) */}
                      {process.env.NODE_ENV === 'development' && <MetricsDebugger />}
                    </div>
                  </div>
                </GamificationProvider>
              </StatisticsProvider>
            </TimerProvider>
          </TaskProvider>
        </AuthWrapper>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
