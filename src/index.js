import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import App from './App';
import DemoApp from './DemoApp'; // Import the demo

// Toggle between main app and demo
const showDemo = window.location.search.includes('demo=true');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {showDemo ? <DemoApp /> : <App />}
  </React.StrictMode>
);
