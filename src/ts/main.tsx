import App from './App';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { loadBears } from './bears';

const root = document.getElementById('root');

if (root === null) {
  throw new Error('Root element not found');
}

const bears = await loadBears();

createRoot(root).render(
  <StrictMode>
    <App bears={bears} />
  </StrictMode>
);
