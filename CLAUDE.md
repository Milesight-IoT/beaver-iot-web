# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Beaver IoT Web is a monorepo-based IoT platform frontend built with React, TypeScript, and Vite. It uses pnpm workspaces to manage multiple packages and applications focused on device management, dashboards, integrations, and workflow automation.

## Development Commands

### Environment Setup
- **Requirements**: `node>=20.0.0`, `pnpm>=8.0.0`
- **Install dependencies**: `pnpm i`
- **Start development**: `pnpm run start` (starts both apps and packages in watch mode)
- **Build**: `pnpm run build` (builds packages first, then apps)
- **Type checking**: `pnpm run tsc`

### Linting & Code Quality
- **ESLint (all)**: `pnpm run lint:apps` and `pnpm run lint:pkgs`
- **Stylelint (all)**: `pnpm run stylelint:apps` and `pnpm run stylelint:pkgs`
- **Individual package linting**: `pnpm --filter=@app/web run lint:fix`

### Internationalization
- **Export new text keys**: `pnpm run i18n:export` (validates and exports untranslated keys to JSON)
- **Import translations**: `pnpm run i18n:import` (imports from `packages/locales/import/`)
- **Text location**: All i18n text is in `packages/locales/src/lang/en` (add new keys here)

### Other Commands
- **Clean all node_modules**: `pnpm run clean`
- **Clean build caches**: `pnpm run clean:cache`
- **Preview production build**: `pnpm run preview`

## Architecture

### Monorepo Structure

```
apps/
  web/              # Main web application (@app/web)
packages/
  locales/          # Internationalization (@milesight/locales)
  scripts/          # Build scripts and tooling (@milesight/scripts)
  shared/           # Shared components, hooks, utils (@milesight/shared)
  spec/             # Project specifications and configs (@milesight/spec)
```

### Web Application (`apps/web/src`)

**Key directories:**
- `pages/` - Feature-based page components (dashboard, device, integration, workflow, entity, user-role, auth, tag-management, setting)
- `components/` - Reusable UI components (code-editor, drawing-board, table-pro, confirm, entity-select, etc.)
- `services/` - API clients and communication layers
  - `http/` - REST API services with OAuth handling
  - `ws/` - WebSocket service for real-time updates
  - `mqtt/` - MQTT client for IoT messaging
  - `map/` - Map service configurations
- `stores/` - Zustand state management
- `routes/` - React Router configuration
- `layouts/` - Application layout components
- `hooks/` - Custom React hooks
- `plugin/plugins/` - Dashboard plugins (charts, switches, triggers, etc. It's deprecated.)
- `styles/` - Global styles and themes

### Shared Package (`packages/shared/src`)

Core library providing common functionality across apps:
- `components/` - Shared components (icons, forms, logo, MS editor, etc.)
- `hooks/` - Shared React hooks
- `utils/` - Utility functions including request handling
- `services/` - Core services (i18n, theme)
- `stores/` - Shared state management
- `styles/` - Theme definitions (dark/light), variables, mixins
- `config/` - Shared configuration

### HTTP Client Architecture

The application uses a centralized HTTP client (`apps/web/src/services/http/client/`) with:
- **OAuth handler**: Automatic token management and refresh
- **Error handler**: Centralized error handling and user notifications
- **Headers handler**: Automatic language header injection
- **API origin handler**: Dynamic API URL configuration

API services are organized by domain (user, device, integration, entity, workflow, dashboard, etc.) in `apps/web/src/services/http/`.

### State Management

- **Zustand** is used for global state
- Stores are in `apps/web/src/stores/` and `packages/shared/src/stores/`
- Component-level state uses React hooks (useState, useReducer)

### Routing

- React Router v6 with nested routes
- Root layout at `apps/web/src/layouts/`
- Dynamic redirects and route-level permissions
- Routes defined in `apps/web/src/routes/`

### Plugin System

Dashboard plugins are located in `apps/web/src/components/drawing-board/plugin/` and support various visualizations:
- Charts: area-chart, bar-chart, horizon-bar-chart, line-chart, pie-chart, radar-chart, gauge-chart
- Data display: data-card, icon-remaining, image
- Controls: switch, trigger

### Styling

- **Less** is used for styling with CSS modules
- Global styles in `apps/web/src/styles/` and `packages/shared/src/styles/`
- Theme variables and mixins from `@milesight/shared` are auto-injected into Less files
- **Material-UI (MUI)** v6 is the primary component library
- Dark/light theme support via theme service
- All color values should reference the corresponding CSS variables in the theme
- Prioritize the use of semantic CSS variables
- The custom style class name should use the `@prefix` prefix, and the MUI style class name prefix should use the `@mui-prefix` prefix

## Configuration

### Environment Variables

Create `.env.local` at project root or in `apps/web/` to override defaults:
- `WEB_DEV_PORT` - Development server port (default: 9000)
- `WEB_API_PROXY` - Backend API proxy URL
- `WEB_SOCKET_PROXY` - WebSocket proxy URL
- `ENABLE_HTTPS` - Enable HTTPS in development
- `ENABLE_VCONSOLE` - Enable vConsole debugging
- `ENABLE_SW` / `ENABLE_SW_DEV` - Service Worker configuration
- `OAUTH_CLIENT_ID` / `OAUTH_CLIENT_SECRET` - OAuth credentials

### Vite Configuration

- Main config: `apps/web/vite.config.mts`
- Uses plugins: React, PWA, SSL, stylelint, node polyfills
- Custom chunk splitting via `@milesight/scripts`
- Path alias: `@/` maps to `apps/web/src/`

## Key Dependencies

- **React 18** with TypeScript
- **Vite** for build tooling
- **Material-UI (MUI)** v6 for UI components
- **Zustand** for state management
- **React Router** v6 for routing
- **Axios** for HTTP requests
- **Leaflet** for maps
- **ECharts** for charting
- **Konva/React Konva** for canvas drawing
- **CodeMirror** for code editing
- **Lexical** for rich text editing
- **MQTT.js** for IoT messaging
- **react-intl-universal** for i18n

## Development Workflow

1. **Adding new features**: Create components in appropriate page directory, use hooks pattern for logic separation
2. **Adding i18n text**: Add to `packages/locales/src/lang/en`, run `pnpm run i18n:export` before committing
3. **Adding dependencies**: Use `pnpm add <package>` with appropriate workspace filter
4. **Shared code**: Add to `packages/shared/src` if used across multiple features
5. **API services**: Add new services to `apps/web/src/services/http/` following existing patterns
6. **Styling**: Use Less modules, leverage shared mixins and variables from `@milesight/shared`

## Testing

Currently no test infrastructure specified. The `test` script exits with an error placeholder.

## Build & Deployment

- Production build: `pnpm run build`
- Output location: `apps/web/dist/` for web app, `packages/*/dist/` for libraries
- Build process: packages build first (via `postinstall` hook), then applications
- PWA support available with configurable Service Worker
