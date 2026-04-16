# Component Development Guidelines

## Directory Structure

Components use **PascalCase** directories with co-located files:

```
src/Components/MyComponent/
├── MyComponent.tsx       # Component implementation
├── MyComponent.scss      # Styles (optional)
├── MyComponent.test.tsx  # Unit tests
└── index.ts              # Re-export (optional)
```

## PatternFly Usage

- Use PatternFly 6 components from `@patternfly/react-core`
- CSS utility classes use `pf-v6-*` prefix (not `pf-v5-*`)
- Import icons from `@patternfly/react-icons`
- Use `@patternfly/react-component-groups` for higher-level patterns
- The dashboard grid uses `@patternfly/widgetized-dashboard` (prerelease)

## State Management

### Atom Conventions

- Atoms live in `src/state/` with `camelCase` naming: `{name}Atom.ts`
- Export the atom as a named export: `export const myAtom = atom<Type>(initialValue)`
- Derived atoms for computed values; write-only atoms for async side effects
- Keep atoms minimal — store only the data needed

### Hook Conventions

- Custom hooks live in `src/hooks/` with `use` prefix: `use{Name}.ts`
- Tests go in `src/hooks/tests/use{Name}.test.ts`
- Prefer hooks over direct atom access in components for complex logic
- Hooks that fetch data should handle loading/error states

## Widget Development

### Widget ID Format

Widget identifiers use `"widgetType#uuid"` format. Always use the helpers:

```tsx
import { getWidgetIdentifier, mapWidgetDefaults, widgetIdSeparator } from '../api/dashboard-templates';

// Create: "myWidget#550e8400-..."
const id = getWidgetIdentifier('myWidget');

// Parse: ["myWidget", "550e8400-..."]
const [type, uuid] = mapWidgetDefaults(id);
```

### Widget Mapping

Widgets are registered in the backend widget mapping. Each entry defines:

```tsx
{
  scope: string;        // Federated module scope (e.g., "insights")
  module: string;       // Module path (e.g., "./RhelWidget")
  importName: string;   // Export name (e.g., "default")
  defaults: {
    w: number;          // Default width in columns
    h: number;          // Default height in rows
    maxH: number;       // Maximum height
    minH: number;       // Minimum height
  };
  config?: {
    icon?: string;      // PatternFly icon name (converted to element by ConvertWidgetMapping)
    title?: string;     // Display title
    headerLink?: { title?: string; href?: string };
    permissions?: WidgetPermission[];  // Access control
  };
}
```

### Permission Filtering

Widgets with `config.permissions` are filtered based on user capabilities via Chrome's `visibilityFunctions`. Widgets the user can't access are excluded from the mapping before rendering.

## Template Data

### Backend vs Frontend Types

| Type | Stored in backend | Used in frontend |
|------|------------------|-----------------|
| `LayoutWithTitle` | Yes | Yes |
| `TemplateConfig` | Yes | Yes |
| `ExtendedLayoutItem` | No | Yes (adds `widgetType`, `config`, `locked`) |
| `ExtendedTemplateConfig` | No | Yes |

The frontend enriches backend data with UI-only fields. When persisting, strip back to `LayoutWithTitle` fields only (`i`, `x`, `y`, `w`, `h`, `maxH`, `minH`, `title`).

## API Integration

- All API functions live in `src/api/dashboard-templates.ts`
- Use native `fetch` (no axios)
- Errors throw `DashboardTemplatesError` with HTTP status
- Template saves are debounced at 1500ms — don't call `patchDashboardTemplate` directly in event handlers; use the hook's `saveTemplate` callback

## Styling

- Use SCSS files co-located with components
- Follow PatternFly spacing/layout utilities where possible
- SCSS prefix for this app: `.widgetLayout, .landing` (from `fec.config.js` `sassPrefix`)
- Avoid inline styles — use SCSS classes or PatternFly utility classes
