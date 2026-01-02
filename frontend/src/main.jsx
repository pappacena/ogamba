import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LogtoProvider } from '@logto/react';
import App from './App.jsx'
import Callback from './Callback.jsx';
import Dashboard from './Dashboard.jsx';

const config = {
  endpoint: import.meta.env.VITE_LOGTO_ENDPOINT || 'http://localhost:3001',
  appId: import.meta.env.VITE_LOGTO_APP_ID || 'ogamba-app',
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <LogtoProvider config={config}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </LogtoProvider>
    </BrowserRouter>
  </StrictMode>,
)
