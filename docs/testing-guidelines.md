# Testing Guidelines

## Test Structure

```
src/
├── Components/
│   └── DnDLayout/
│       ├── GridLayout.test.tsx     # Component unit tests
│       └── __snapshots__/          # Jest snapshots
├── hooks/
│   └── tests/
│       ├── useDashboardConfig.test.ts
│       ├── useDashboardTemplate.test.ts
│       ├── useGetDashboards.test.ts
│       └── ...                     # One test file per hook
playwright/
├── widget-layout.spec.ts           # E2E tests
└── README.md
```

## Unit Tests (Jest)

### Setup

- Jest 27 with `jest-environment-jsdom`
- React Testing Library (`@testing-library/react`)
- `@testing-library/jest-dom` extended matchers (via `config/jest.setup.js`)
- CSS/SCSS/SVG mocked via `identity-obj-proxy`
- Coverage collected from `src/**/*.js`

### Required Mocks

Every test file must mock these Chrome shell dependencies:

```tsx
// Mock useChrome hook
jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  __esModule: true,
  default: () => ({
    auth: { getUser: jest.fn().mockResolvedValue({ identity: { user: { username: 'test-user' } } }) },
    analytics: { track: jest.fn() },
  }),
}));

// Mock Scalprum for federated widgets
jest.mock('@scalprum/react-core', () => ({
  ScalprumComponent: ({ scope, module }: { scope: string; module: string }) => (
    <div data-testid={`scalprum-${scope}-${module}`}>ScalprumWidget</div>
  ),
}));
```

### Jotai Test Pattern

Use `createStore` + `Provider` to inject atom values:

```tsx
import { Provider, createStore } from 'jotai';

function renderWithStore(ui: React.ReactElement, overrides?: Record<string, unknown>) {
  const store = createStore();
  if (overrides?.widgetMapping) store.set(widgetMappingAtom, overrides.widgetMapping);
  if (overrides?.layoutVariant) store.set(layoutVariantAtom, overrides.layoutVariant);
  return render(<Provider store={store}>{ui}</Provider>);
}
```

### jsdom Polyfills

`crypto.randomUUID` is not available in jsdom — polyfill at the top of test files that use widget ID generation:

```tsx
Object.defineProperty(global, 'crypto', {
  value: { randomUUID: () => 'test-uuid-1234' },
});
```

### API Mocking

Mock `fetch` or individual API functions from `src/api/dashboard-templates.ts`:

```tsx
jest.mock('../../api/dashboard-templates', () => ({
  ...jest.requireActual('../../api/dashboard-templates'),
  getDashboardTemplates: jest.fn(),
  patchDashboardTemplate: jest.fn(),
}));
```

### Snapshot Tests

Snapshot tests exist for component rendering states. Update snapshots with:

```bash
npm test -- -u
```

Review snapshot diffs carefully — they catch unintended UI regressions.

## E2E Tests (Playwright)

- Config: `playwright.config.ts` at repo root
- Tests: `playwright/widget-layout.spec.ts`
- Auth: Uses `@redhat-cloud-services/playwright-test-auth` for HCC authentication
- Run: `npm run test:playwright`

## Running Tests

```bash
npm test                # Unit tests only
npm run test:playwright # E2E tests
npm run verify          # Build + lint + test (full CI equivalent)
```
