import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';

import App from './App.tsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <>
        <App />
        <Toaster
          position="bottom-right"
          visibleToasts={3}
          closeButton={false}
          className="[&_[data-close-button]]:hidden"
          toastOptions={{
            duration: 2800,
            classNames: {
              toast:
                'rounded-2xl border border-gray-100 bg-white px-4 py-3 text-gray-900 shadow-2xl shadow-gray-900/10 ring-1 ring-black/5',
              title: 'text-sm font-semibold text-gray-900',
              description: 'text-xs leading-5 text-gray-500',
              icon: 'text-current',
              success: 'border-success-100 bg-white text-success-600',
              error: 'border-error-100 bg-white text-error-600',
              warning: 'border-warning-100 bg-white text-warning-600',
            },
          }}
        />
      </>
    </AuthProvider>
  </StrictMode>
);
