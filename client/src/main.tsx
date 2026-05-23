import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import './index.css';

// Prevent flash of unstyled content (FOUC) by synchronizing the local storage theme directly on the document root
const storedTheme = localStorage.getItem('flowsprint-theme') || 'dark';
document.documentElement.classList.remove('light', 'dark');
document.documentElement.classList.add(storedTheme);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
