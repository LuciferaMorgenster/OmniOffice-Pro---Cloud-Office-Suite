import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register PWA Service Worker for offline capabilities
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('OmniOffice PWA Service Worker active:', reg.scope);
      })
      .catch((err) => {
        console.warn('PWA Service Worker registration skipped:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(<App />);

