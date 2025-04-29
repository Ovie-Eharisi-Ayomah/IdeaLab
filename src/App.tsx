import React, { useState, useEffect } from 'react';
import BusinessIdeaForm from './components/BusinessIdeaForm';
import { Lightbulb, Moon, Sun } from 'lucide-react';
import './index.css'; 
import './App.css';

function App() {
  const [darkMode, setDarkMode] = useState<boolean>(false);

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
  }, []);

  return (
    <div className={`app-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
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

      {/* Main Content Area */}
      <main className="main-content">
         <BusinessIdeaForm />
      </main>
    </div>
  );
}

export default App;
