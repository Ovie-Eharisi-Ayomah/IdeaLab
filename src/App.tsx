import React, { useState, useEffect } from 'react';
import BusinessIdeaForm from './components/BusinessIdeaForm';
import { IdeaLabDashboard } from './components/dashboard';
import { Lightbulb, Moon, Sun, ArrowLeft } from 'lucide-react';
import './index.css'; 
import './App.css';

function App() {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [showDashboard, setShowDashboard] = useState<boolean>(false);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // Update document class for global styling
    if (!darkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
    // Save preference to localStorage
    localStorage.setItem('darkMode', (!darkMode).toString());
  };

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    
    if (savedDarkMode !== null) {
      // Use saved preference
      const isDarkMode = savedDarkMode === 'true';
      setDarkMode(isDarkMode);
      if (isDarkMode) {
        document.documentElement.classList.add('dark-mode');
      }
    } else {
      // Use system preference
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDarkMode);
      if (prefersDarkMode) {
        document.documentElement.classList.add('dark-mode');
      }
    }

    // Check if we should show the dashboard from URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('view') === 'dashboard') {
      setShowDashboard(true);
    }
  }, []);

  // Handle form submission to show dashboard
  const handleFormSubmit = () => {
    setShowDashboard(true);
    // Update URL for bookmarking
    const url = new URL(window.location.href);
    url.searchParams.set('view', 'dashboard');
    window.history.pushState({}, '', url);
  };

  // Handle going back to form
  const handleBackToForm = () => {
    setShowDashboard(false);
    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.delete('view');
    window.history.pushState({}, '', url);
  };

  return (
    <div className={`app-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      {!showDashboard ? (
        <>
          {/* Header */}
          <header className="app-header">
            <div className="header-content">
              <div className="header-wrapper">
                <div className="logo-container">
                  <Lightbulb className="logo-icon" />
                  <h1 className="logo-text">Idea Lab</h1>
                </div>
                
                <button 
                  className="theme-toggle-button"
                  onClick={toggleDarkMode}
                  aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </div>
            </div>
          </header>

          {/* Main Content Area - Form */}
          <main className="main-content">
            <BusinessIdeaForm />
            {/* Demo button to view dashboard */}
            <div className="max-w-768px mx-auto px-4 mt-8 text-center">
              <button 
                onClick={handleFormSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                View Dashboard Demo
              </button>
            </div>
          </main>
        </>
      ) : (
        <>
          {/* Dashboard View */}
          {/* Small back button in top corner */}
          <button
            onClick={handleBackToForm}
            className="fixed top-4 left-4 z-50 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md"
            aria-label="Back to form"
          >
            <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
          </button>
          
          <IdeaLabDashboard />
        </>
      )}
    </div>
  );
}

export default App;
