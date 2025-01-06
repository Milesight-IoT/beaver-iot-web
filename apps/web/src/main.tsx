import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { i18n, theme } from '@milesight/shared/src/services';
import routes from '@/routes';
import '@/styles/index.less';

const router = createBrowserRouter(routes, { basename: '/' });
const root = createRoot(document.getElementById('root')!);

// 国际化初始化
i18n.initI18n('web', 'EN');

// 系统主题初始化
theme.initTheme();

/**
 * 注意：严格模式，且开发环境下，React 应用初始化时会刻意执行两次渲染，用于突出显示潜在问题。
 *
 * https://zh-hans.react.dev/reference/react/StrictMode
 */
root.render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>,
);
