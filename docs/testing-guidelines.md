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
- Tests: `playwright/widget-layout.spec.ts`, `playwright/editing-dashboard.spec.ts`
- Auth: Uses `@redhat-cloud-services/playwright-test-auth` for HCC authentication
- Run: `npm run test:playwright`

See [`playwright/README.md`](../playwright/README.md) for detailed Playwright setup and troubleshooting.

### Critical E2E Patterns

#### 1. ALWAYS Disable Cookie Consent First

The TrustArc cookie consent popup blocks clicks and causes mysterious timeouts. **This is the #1 cause of flaky E2E tests.**

```typescript
import { disableCookiePrompt } from '@redhat-cloud-services/playwright-test-auth';

test.beforeEach(async ({ page }) => {
  await disableCookiePrompt(page);  // ← MUST be first, before goto!
  await page.goto('/');
});
```

**Symptoms of missing `disableCookiePrompt()`:**
- Tests timeout waiting for buttons/elements
- Error mentions `truste_overlay` or `truste_popframe` intercepting pointer events
- Tests pass locally but fail in CI

#### 2. Pure E2E vs Integration Tests

**Pure E2E** = User interactions only (clicking, typing, dragging)
```typescript
// ✅ Good: Pure E2E
test('should remove widget', async ({ page }) => {
  const menuToggle = page.locator('button.pf-v6-widget-grid-tile__menu-toggle');
  await menuToggle.click();
  await page.getByRole('menuitem', { name: 'Remove' }).click();
  // Verify via UI
});
```

**Integration Test** = API setup + UI verification
```typescript
// ❌ Avoid: API calls don't work with page.request (no auth cookies)
const response = await page.request.post('/api/widget-layout/v1/import', { ... });
```

**Lesson**: Use pure E2E for this project. API-based setup doesn't work reliably in the HCC authenticated environment.

#### 3. Use Symbolic Constants for Timeouts

Never hardcode timeout values. CI environments have constrained resources.

```typescript
// At top of test file
const DRAWER_ANIMATION_MS = 1000;      // Animation/transition durations
const MODAL_TRANSITION_MS = 500;
const PAGE_LOAD_TIMEOUT_MS = 30000;    // Initial page load with auth
const WIDGET_LOAD_TIMEOUT_MS = 10000;  // Widget tiles appearing
const DRAWER_TIMEOUT_MS = 5000;        // Drawer open/close

// Usage
await expect(drawerText).toBeVisible({ timeout: DRAWER_TIMEOUT_MS });
await page.waitForTimeout(MODAL_TRANSITION_MS);
```

**Why**: Makes constraints visible, easier to adjust globally, and prevents magic numbers.

**Warning**: If you need timeouts over 30 seconds, something is broken. Fix the root cause, don't increase the timeout.

#### 4. Never Suppress Errors with `.catch(() => false)`

```typescript
// ❌ BAD: Hides failures that cascade through test suite
const isVisible = await element.isVisible().catch(() => false);

// ✅ GOOD: Let errors surface, add proper state verification
await expect(widgetTiles.first()).toBeVisible({ timeout: WIDGET_LOAD_TIMEOUT_MS });
const isDrawerVisible = await drawerText.isVisible();
```

**Lesson**: Silent failures break test isolation. Test N passes with broken state → Test N+1 inherits the mess.

#### 5. Clean Up Test State in `finally` Blocks

Tests that modify dashboard state MUST reset for subsequent tests:

```typescript
test('should remove all widgets', async ({ page }) => {
  try {
    // Remove widgets and verify behavior
    for (let i = 0; i < widgetCount; i++) {
      // ... remove widget
    }
    // Verify empty state
  } finally {
    // CRITICAL: Reset for next test
    const resetButton = page.getByRole('button', { name: 'Reset to default' });
    await resetButton.click();
    
    const checkbox = page.getByRole('checkbox', { name: /I understand/i });
    await checkbox.check();
    
    const confirmButton = page.getByRole('button', { name: 'Reset layout' });
    await confirmButton.click();
    
    await expect(page.locator('.pf-v6-widget-grid-tile').first())
      .toBeVisible({ timeout: WIDGET_LOAD_TIMEOUT_MS });
  }
});
```

#### 6. Verify Page State Before Interactions

Don't assume the page is ready. Verify critical elements exist before testing drawer/modal behavior:

```typescript
// ✅ GOOD: Verify widgets loaded before testing drawer
const widgetTiles = page.locator('.pf-v6-widget-grid-tile');
await expect(widgetTiles.first()).toBeVisible({ timeout: WIDGET_LOAD_TIMEOUT_MS });

// Now safe to test drawer
await page.getByRole('button', { name: 'Add widgets' }).click();
```

#### 7. Use Semantic Selectors

Prefer accessibility-based selectors over brittle class/ID selectors:

```typescript
// ✅ GOOD: Semantic, survives refactoring
page.getByRole('button', { name: 'Add widgets' })
page.getByRole('menuitem', { name: 'Remove' })
page.getByRole('checkbox', { name: /I understand/i })

// ⚠️  OK: OUIA selectors for widget-specific elements
page.locator('[data-ouia-component-id^="add-widget-card-"]')

// ❌ AVOID: Brittle class selectors (use only when necessary)
page.locator('.pf-v6-widget-grid-tile__menu-toggle')
```

### Common Pitfalls

| Problem | Symptom | Solution |
|---------|---------|----------|
| Cookie consent popup | Timeouts, "intercepts pointer events" | Add `disableCookiePrompt(page)` before navigation |
| Empty dashboard from previous test | "No widgets found" errors | Add cleanup in `finally` block |
| Timeouts over 30s | Tests take 3+ minutes | Fix root cause (cookie popup, API issues) - don't increase timeout |
| API 401 errors | `page.request.post` fails | Use UI interactions instead - API setup doesn't work with auth |
| Test isolation failures | Test N passes, Test N+1 fails | Remove `.catch(() => false)` error suppression |
| Hardcoded waits | CI flakiness | Use symbolic constants, increase only animation waits |

### Historical Context

These guidelines were learned the hard way during widget removal test stabilization (July 2026). Key discoveries:

1. **Cookie consent popup was blocking all CI tests** - took hours to diagnose because the error was buried in timeout messages
2. **`page.request` doesn't inherit browser auth** - switching to pure E2E fixed intermittent 401 errors
3. **Error suppression broke test isolation** - removing `.catch(() => false)` revealed hidden state pollution
4. **3-minute timeouts were masking real problems** - reducing to 10s forced us to fix root causes

If E2E tests start failing mysteriously, check cookie consent first. It's almost always the cookie consent popup.

## Running Tests

```bash
npm test                # Unit tests only
npm run test:playwright # E2E tests
npm run verify          # Build + lint + test (full CI equivalent)
```
