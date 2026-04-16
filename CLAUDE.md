@AGENTS.md

## Commands

### Build
```bash
npm run build          # Production build via fec
npm run verify         # Build + lint + test (full verification)
```

### Test
```bash
npm test               # Jest unit tests (passWithNoTests)
npm run test:playwright # Playwright e2e tests
npm run test:ct        # Cypress component tests
```

### Lint
```bash
npm run lint           # ESLint + Stylelint
npm run lint:js        # ESLint only
npm run lint:sass      # Stylelint (SCSS) only
npm run lint:js:fix    # ESLint with auto-fix
```

### Dev Server
```bash
npm run start          # Start dev proxy (HOT reload enabled)
CONFIG_PORT=8000 npm run start  # With local chrome-service-backend
```

## Notes

- Run `npm run verify` before suggesting a PR — it runs build, lint, and test in sequence
- Default branch is `master`
- Jest config collects coverage from `src/**/*.js` (not `.ts`/`.tsx` — coverage may show 0% for TypeScript files, but tests still run)
- Snapshot tests exist in `src/Components/DnDLayout/__snapshots__/` — update with `npm test -- -u` if intentional changes
