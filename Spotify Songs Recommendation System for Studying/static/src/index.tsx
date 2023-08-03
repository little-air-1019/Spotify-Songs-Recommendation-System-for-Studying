import * as React from 'react';
import { createRoot } from 'react-dom/client';

import { Homepage } from './app';

const elements = (
    <Homepage />
);

const root = createRoot(document.getElementById('root'));

root.render(
    <React.StrictMode>
        {elements}
    </React.StrictMode>
);