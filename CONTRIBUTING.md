# Contributing to widget-layout

## Prerequisites

- Node.js >= 16.20.2
- npm >= 7.24.2
- `/etc/hosts` entry for `*.foo.redhat.com` (run `npm run patch:hosts`)

## Setup

```bash
git clone <repo-url>
cd widget-layout
npm install
npm run start
```

Open the URL shown in terminal output. For local backend integration, see [README.md](README.md#run-locally-with-chrome-service-be).

## Development Workflow

1. Create a feature branch from `master`
2. Make changes following the conventions in [AGENTS.md](AGENTS.md)
3. Run `npm run verify` (build + lint + test)
4. Commit using conventional commit format
5. Open a PR against `master`

## Commit Conventions

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): short description
```

**Types**: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`

**Scopes**: `grid`, `widgets`, `hub`, `api`, `state`, `header`, `drawer`

**Examples**:
```
feat(grid): add snap-to-grid for widget placement
fix(api): handle 404 when template not found
refactor(state): consolidate layout atoms
test(hooks): add useDashboardConfig error handling tests
docs: update layout data format documentation
```

**Rules**:
- Title line ≤ 50 characters
- Imperative mood ("add" not "added")
- Reference Jira ticket key in commit body (not title)
- Atomic commits — one logical change per commit

## Testing

Run tests before submitting:

```bash
npm test               # Unit tests (Jest)
npm run test:playwright # E2E tests (Playwright)
npm run lint           # Linting (ESLint + Stylelint)
npm run verify         # All of the above + build
```

See [Testing Guidelines](docs/testing-guidelines.md) for patterns and conventions.

### E2E Test Checklist

When writing or modifying Playwright tests:

- [ ] **Cookie consent disabled** - Call `disableCookiePrompt(page)` before `page.goto()`
- [ ] **Pure E2E** - Use UI interactions only, not API calls
- [ ] **Symbolic constants** - No hardcoded timeouts (use `WIDGET_LOAD_TIMEOUT_MS`, etc.)
- [ ] **State verification** - Verify page loaded before testing drawer/modal behavior
- [ ] **No error suppression** - Avoid `.catch(() => false)` patterns
- [ ] **Cleanup in finally** - Reset dashboard state if test modifies it
- [ ] **Semantic selectors** - Prefer `getByRole()` over class selectors
- [ ] **Reasonable timeouts** - If you need >30s, fix the root cause instead

**Golden rule**: If tests pass locally but fail in CI with timeouts, check cookie consent first.

## PR Guidelines

- Keep PRs focused on a single concern
- Include screenshots for UI changes
- Ensure CI passes (lint, test, build)
- Update documentation if behavior changes
- Link related Jira tickets
