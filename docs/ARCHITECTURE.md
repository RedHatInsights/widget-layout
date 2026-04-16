# Architecture

## System Overview

widget-layout is a React micro-frontend that runs inside the Red Hat Hybrid Cloud Console (HCC) shell. It provides a customizable dashboard where users arrange widgets loaded from other HCC applications via Webpack Module Federation.

```
┌─────────────────────────────────────────────────┐
│ HCC Shell (insights-chrome)                     │
│  ┌─────────────────────────────────────────┐    │
│  │ widget-layout (this repo)               │    │
│  │  ┌──────────┐ ┌──────────┐ ┌────────┐  │    │
│  │  │ Widget A │ │ Widget B │ │Widget C│  │    │
│  │  │(remote)  │ │(remote)  │ │(remote)│  │    │
│  │  └──────────┘ └──────────┘ └────────┘  │    │
│  └─────────────────────────────────────────┘    │
│                                                  │
│  Backend: chrome-service-backend (Go)            │
│  Backend: widget-layout-backend (Go)             │
└─────────────────────────────────────────────────┘
```

## Key Architectural Decisions

### Federated Modules

The app exposes three federated modules via `fec.config.js`:

- **`./RootApp`** — Full standalone app (AppEntry → App → DefaultRoute)
- **`./WidgetLayout`** — Embeddable grid layout component for the landing page
- **`./DashboardHub`** — Multi-dashboard management interface with routing

Widgets rendered inside the grid are themselves remote federated modules loaded via **Scalprum** (`@scalprum/react-core`). The widget mapping (which modules to load) comes from the backend.

### State Management (Jotai)

All shared state uses Jotai atoms, avoiding Redux or Context:

| Atom | Purpose |
|------|---------|
| `templateAtom` | Current dashboard template config (all breakpoints) |
| `templateIdAtom` | Active template database ID |
| `layoutVariantAtom` | Current responsive breakpoint (`sm`/`md`/`lg`/`xl`) |
| `widgetMappingAtom` | Available widgets (filtered by user permissions) |
| `resolvedWidgetMappingAtom` | Write-only atom that fetches + filters widget mapping |
| `drawerExpandedAtom` | Widget drawer open/closed state |
| `currentDropInItemAtom` | Widget type being dragged into grid |
| `currentlyUsedWidgetsAtom` | List of widget types currently on dashboard |
| `lockedLayoutAtom` | Whether layout editing is disabled |
| `notificationsAtom` | Toast notification queue |

### Two Dashboard Modes

1. **Landing Page** (`useDashboardConfig` hook) — Uses global Jotai atoms (`templateAtom`, `templateIdAtom`). Template fetched via `/api/chrome-service/v1/dashboard-templates`. Persists via PATCH to chrome-service.

2. **Dashboard Hub** (`useDashboardTemplate` hook) — Uses local React state. Template fetched via `/api/widget-layout/v1/{id}`. Supports multiple named dashboards with create, copy, import/export, delete, and set-default operations.

### Backend API Integration

Two backend services provide APIs:

| Service | Base Path | Responsibilities |
|---------|-----------|-----------------|
| chrome-service-backend | `/api/chrome-service/v1/dashboard-templates/` | Base templates, widget mapping, legacy template CRUD |
| widget-layout-backend | `/api/widget-layout/v1/` | User dashboards, import/export, copy, set default |

Template changes are persisted with a **1500ms debounce** to avoid excessive API calls during drag operations.

### Responsive Grid System

Layouts are stored per-breakpoint. When the viewport resizes, the active breakpoint changes and the corresponding layout is rendered:

| Breakpoint | Min Width | Columns | Use Case |
|------------|-----------|---------|----------|
| `sm` | 0px | 1 | Mobile |
| `md` | 1100px | 2 | Tablet |
| `lg` | 1400px | 3 | Desktop |
| `xl` | 1550px | 4 | Wide desktop |

When a widget is added, it's inserted into all four breakpoint layouts with appropriate sizing constraints (width capped to available columns per breakpoint).

### Widget Mapping Pipeline

```
Backend (JSON)          ConvertWidgetMapping.tsx       PatternFly GridLayout
─────────────────  ──→  ────────────────────────  ──→  ──────────────────
{                       - icon string → React         Renders widgets with
  scope, module,          element (PatternFly icons)   correct icons, titles,
  importName,           - adds renderWidget fn          links, and permissions
  defaults, config        (ScalprumComponent)
}                       - adds wrapperProps,
                          cardBodyProps
```

## Deployment

- **Frontend CRD**: `deploy/frontend.yaml` defines the Kubernetes `Frontend` custom resource
- **Build**: `fec build` produces static assets
- **CI**: `pr_check.sh` and `build_deploy.sh` scripts for Konflux/Jenkins pipelines
- **Proxy**: Dev server uses `fec dev-proxy` with optional local chrome-service-backend routing
