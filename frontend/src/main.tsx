import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AppProviders } from './providers/AppProviders';
import { router } from './routes/router';
import './styles/global.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Failed to find root element');
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </React.StrictMode>
);
