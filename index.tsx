import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './src/globals.css';

// Add global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  document.body.innerHTML = `<div style="padding: 20px; font-family: monospace;">
    <h1>Error Loading App</h1>
    <pre>${event.error?.stack || event.error}</pre>
  </div>`;
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);