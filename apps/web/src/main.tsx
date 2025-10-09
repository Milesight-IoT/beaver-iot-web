import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { i18n, theme } from '@milesight/shared/src/services';
import '@milesight/shared/src/utils/lang-polyfill';
import routes from '@/routes';
import '@/styles/index.less';

const router = createBrowserRouter(routes, { basename: '/' });
const root = createRoot(document.getElementById('root')!);

// Internationalization initialization
i18n.initI18n('web', 'CN');

// System topic initialization
theme.initTheme();

/**
 * Note: Strict mode, and in development environments, React applications are intentionally rendered twice during initialization to highlight potential problems.
 *
 * https://zh-hans.react.dev/reference/react/StrictMode
 */
root.render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>,
);
