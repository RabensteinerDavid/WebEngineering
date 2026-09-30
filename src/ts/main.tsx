import * as React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import initSearchHighlighter from './search-highlighter';
import initComments from './comments';
import initBears from './bears';

function App(): React.JSX.Element {
  return <h1>This is the new wildlife section.</h1>;
}

const root = document.getElementById('root');

if (root === null) {
  throw new Error('Root element not found');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);

initSearchHighlighter();
initComments();
await initBears();
