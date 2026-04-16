# Agent Guidelines — widget-layout

## Project Overview

Drag-and-drop dashboard widget layout for Red Hat Hybrid Cloud Console (HCC). Users customize their landing page by adding, removing, repositioning, and resizing widgets loaded via Webpack Module Federation from other HCC applications.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI framework | React 18, TypeScript 5 |
| Component library | PatternFly 6 (`@patternfly/react-core`, `@patternfly/react-component-groups`) |
| Dashboard engine | `@patternfly/widgetized-dashboard` (prerelease) + `react-grid-layout` |
| State management | Jotai (atoms in `src/state/`) |
| Build system | Webpack via `fec` CLI (`@redhat-cloud-services/frontend-components-config`) |
| Module federation | Scalprum / `@scalprum/react-core` for loading remote widgets |
| Routing | React Router DOM v6 |
| Styling | SCSS (co-located with components) + PatternFly utility classes |
| Unit testing | Jest 27 + React Testing Library |
| E2E testing | Playwright |
| Linting | ESLint + Stylelint (SCSS) |

## Directory Structure

```
src/
├── api/                    # API client functions (dashboard-templates.ts)
├── Components/             # PascalCase component directories
│   ├── DnDLayout/          # Core grid layout (GridLayout, ConvertWidgetMapping)
│   ├── WidgetDrawer/       # Widget selection drawer
│   ├── Header/             # Dashboard header with actions
│   ├── DashboardHub/       # Multi-dashboard management views
│   ├── Widgets/            # Built-in widget components
│   ├── CreateModal/        # Dashboard creation dialog
│   ├── DuplicateModal/     # Dashboard duplication dialog
│   └── Icons/              # Custom icon components
├── Modules/                # Federated module entry points
│   ├── DashboardHub.tsx    # Multi-dashboard hub (exposed as ./DashboardHub)
│   └── GenericDashboardPage.tsx
├── Routes/                 # Route components
│   └── Default/            # Default dashboard route (exposed as ./WidgetLayout)
├── hooks/                  # Custom React hooks (camelCase)
│   ├── useDashboardConfig.ts   # Template loading + persistence for landing page
│   ├── useDashboardTemplate.ts # Template loading for generic dashboards
│   ├── useGetDashboards.ts     # Fetch all user dashboards
│   └── tests/              # Hook unit tests
├── state/                  # Jotai atoms (camelCase)
│   ├── templateAtom.ts     # Current template config
│   ├── layoutAtom.ts       # Active layout variant + active item
│   ├── widgetMappingAtom.ts # Widget registry with permission filtering
│   └── ...
├── types/                  # TypeScript type declarations
├── consts.ts               # Grid constants (columns, dropping_elem_id)
├── AppEntry.tsx            # Federation entry point (exposed as ./RootApp)
└── App.tsx                 # Root component
```

## Federated Module Exports

Defined in `fec.config.js`:

| Export | File | Purpose |
|--------|------|---------|
| `./RootApp` | `src/AppEntry.tsx` | Standalone app entry |
| `./WidgetLayout` | `src/Routes/Default/Default.tsx` | Embeddable dashboard layout |
| `./DashboardHub` | `src/Modules/DashboardHub.tsx` | Multi-dashboard management |

## Key Conventions

### State Management
- All shared state lives in Jotai atoms under `src/state/`
- Use `useAtomValue` for read-only, `useSetAtom` for write-only, `useAtom` for read-write
- Never use React context or Redux for new state — Jotai only
- Derived/async atoms (e.g., `resolvedWidgetMappingAtom`) handle side effects like permission filtering

### Component Patterns
- Component directories use **PascalCase** (`DnDLayout/`, `WidgetDrawer/`)
- Hooks and atoms use **camelCase** (`useDashboardConfig.ts`, `templateAtom.ts`)
- Co-locate SCSS with component files
- Use PatternFly components (`PageSection`, `EmptyState`, `Button`, etc.) — don't build custom equivalents
- Access Chrome services via `useChrome()` hook (auth, analytics, visibility functions)

### API Layer
- All API functions live in `src/api/dashboard-templates.ts`
- Two API surfaces:
  - `/api/chrome-service/v1/dashboard-templates/` — base templates, widget mapping, legacy template CRUD
  - `/api/widget-layout/v1/` — user dashboard CRUD, import/export, copy, set default
- Template persistence is debounced (1500ms via `awesome-debounce-promise`)
- Widget IDs follow `"widgetType#uuid"` format (separator: `#`)
- Error handling uses custom `DashboardTemplatesError` class with HTTP status

### Responsive Grid
- Four breakpoints: `sm` (800px), `md` (1100px), `lg` (1400px), `xl` (1550px)
- Column counts: `sm: 1`, `md: 2`, `lg: 3`, `xl: 4`
- Sidebar mode uses narrower breakpoints (500/800/1100/1250px)
- Templates store layout per breakpoint (`TemplateConfig = { [Variants]: LayoutWithTitle[] }`)

### Widget System
- Widgets are remote federated modules loaded via Scalprum
- Widget mapping fetched from backend, filtered by user permissions
- `ConvertWidgetMapping.tsx` transforms Scalprum widget config → PatternFly widget config (icon strings → React elements)
- Each widget has `defaults` (w, h, maxH, minH) and optional `config` (icon, title, headerLink, permissions)

## Common Pitfalls

1. **Don't use global `DB` patterns** — this is a frontend app, state is in Jotai atoms
2. **Don't import PatternFly v5 classes** — this repo uses PatternFly v6 (`pf-v6-*` prefix)
3. **Widget IDs contain `#` separator** — always use `widgetIdSeparator` constant and `mapWidgetDefaults()` to parse
4. **Template has UI-only fields** — `ExtendedLayoutItem.widgetType`, `.config`, `.locked` are NOT persisted to backend; only `LayoutWithTitle` fields go to API
5. **Mock `useChrome` in tests** — it provides auth, analytics, and visibility functions from Chrome shell
6. **Mock `@scalprum/react-core`** — `ScalprumComponent` loads remote modules at runtime; tests must mock it
7. **`crypto.randomUUID` needs polyfill** in jsdom test environment
8. **Two template hooks exist** — `useDashboardConfig` (landing page, uses global atoms) vs `useDashboardTemplate` (generic dashboards, local state)

## Documentation Index

| Document | Description |
|----------|-------------|
| [README.md](README.md) | Setup, getting started, local development |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution workflow and conventions |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, data flow, deployment |
| [docs/testing-guidelines.md](docs/testing-guidelines.md) | Jest and Playwright testing patterns |
| [docs/component-development-guidelines.md](docs/component-development-guidelines.md) | Widget and component development patterns |
| [docs/layout-data-format.md](docs/layout-data-format.md) | Layout data structures and API endpoints |
| [docs/ai-agent-guidelines.md](docs/ai-agent-guidelines.md) | Guidelines for AI-generated code documentation |
| [docs/components/](docs/components/) | Individual component documentation |
