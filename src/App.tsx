import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import BusinessIdeaForm from './components/BusinessIdeaForm';
import AnalysisResultsPage from './pages/AnalysisResultsPage'; // Restore original results page
import { Waypoints, Moon, Sun } from 'lucide-react';
import './index.css'; 
import './App.css';

// Layout component with header
const AppLayout = ({ children, darkMode, toggleDarkMode }: { children: React.ReactNode, darkMode: boolean, toggleDarkMode: () => void }) => {
  return (
    <>
      <header className="app-header">
        <div className="header-content">
          <div className="header-wrapper">
            <div className="logo-container">
              <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                <Waypoints className="logo-icon" />
                <h1 className="logo-text">Semita AI</h1>
              </Link>
            </div>
            
            <button 
              className="theme-toggle-button"
              onClick={toggleDarkMode}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? (
                <Sun 
                  size={20} 
                  width={20} 
                  height={20} 
                  strokeWidth={2} 
                  style={{ display: 'block' }} 
                />
              ) : (
                <Moon 
                  size={20} 
                  width={20} 
                  height={20} 
                  strokeWidth={2} 
                  style={{ display: 'block' }} 
                />
              )}
            </button>
          </div>
        </div>
      </header>
      <main className="main-content">
        {children}
      </main>
    </>
  );
};

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
    <BrowserRouter>
    <div className={`app-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
        <Routes>
          <Route 
            path="/" 
            element={
              <AppLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                <BusinessIdeaForm />
              </AppLayout>
            } 
          />
          {/* Route to the REAL Analysis Results Page */}
          <Route 
            path="/results/:jobId" 
            element={<AnalysisResultsPage />} 
          />
          {/* Optional: You could have a specific mock route too if needed */}
          {/* <Route path="/mock-results" element={<MockAnalysisResultsPage />} /> */}
          <Route 
            path="*" 
            element={<Navigate to="/" replace />} 
          />
        </Routes>
    </div>
    </BrowserRouter>
  );
}

export default App;
