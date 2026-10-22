import { Page, expect, test } from '@playwright/test';
import { disableCookiePrompt } from '@redhat-cloud-services/playwright-test-auth';
import { PAGE_LOAD_TIMEOUT_MS } from './helpers';

/**
 * The conversion opt-in banner is rendered in the landing page header by
 * `src/Components/Header/ConversionBanner.tsx`, but the markup itself comes from RBAC's
 * `./modules/ConversionOptInBanner` federated module — so this is the only level at which
 * the copy and the wiring can be verified together.
 *
 * Two preconditions gate the banner, and neither is under this repo's control, so the tests
 * skip rather than fail when they are not met:
 *
 * - the `platform.conversion.opt-in-banner` feature flag, and
 * - the test account being an org admin.
 */

const CONVERSION_FLAG = 'platform.conversion.opt-in-banner';

/**
 * Local escape hatch for verifying the banner before the flag is rolled out.
 *
 * `FORCE_CONVERSION_FLAG=true npx playwright test playwright/conversion-banner.spec.ts`
 *
 * Patches the toggle into the Unleash proxy response so Chrome's client reports it enabled.
 * Opt-in by design: CI never sets it, so CI keeps honestly skipping until the real flag is on.
 */
const FORCE_FLAG = process.env.FORCE_CONVERSION_FLAG === 'true';

// Copy owned by RBAC (`src/Messages.js`), duplicated here because the banner crosses a
// module federation boundary. If these assertions fail, check whether RBAC changed the copy.
const BANNER_TITLE = 'Elevate your infrastructure with workspace-based access management';
const BANNER_BODY = /Organize your RHEL systems into workspaces with hierarchical permission control/;
const GET_STARTED = 'Get started now';
const LEARN_MORE = 'Learn more about the benefits';

/**
 * PatternFly renders `variant="custom"` alerts without `role="alert"`, and puts the title in
 * a heading whose accessible name is prefixed with "Custom alert:" — hence the regex rather
 * than an exact name match.
 */
const bannerHeading = (page: Page) => page.getByRole('heading', { name: new RegExp(BANNER_TITLE) });

/** Reads the toggle straight from the Unleash proxy Chrome itself uses. */
const isConversionFlagEnabled = async (page: Page): Promise<boolean> => {
  const response = await page.request.get('/api/featureflags/v0');
  if (!response.ok()) {
    return false;
  }

  const body = (await response.json()) as { toggles?: Array<{ name: string; enabled: boolean }> };
  return Boolean(body.toggles?.some((toggle) => toggle.name === CONVERSION_FLAG && toggle.enabled));
};

const isOrgAdmin = async (page: Page): Promise<boolean> => {
  const user = await page.evaluate(async () => {
    const chrome = (window as unknown as { insights?: { chrome?: { auth?: { getUser?: () => Promise<unknown> } } } }).insights?.chrome;
    return (await chrome?.auth?.getUser?.()) ?? null;
  });

  return Boolean((user as { identity?: { user?: { is_org_admin?: boolean } } } | null)?.identity?.user?.is_org_admin);
};

test.describe('Widget Layout - Conversion Opt-In Banner', () => {
  test.beforeEach(async ({ page }) => {
    await disableCookiePrompt(page);

    // Checked before navigating: when the flag is off there is nothing to test, and loading
    // the page first would make the skip hostage to how fast the environment responds.
    test.skip(!FORCE_FLAG && !(await isConversionFlagEnabled(page)), `${CONVERSION_FLAG} is not enabled in this environment`);

    // Must be registered before the first navigation, or Chrome's initial flag fetch escapes it.
    if (FORCE_FLAG) {
      await page.route('**/api/featureflags/v0**', async (route, request) => {
        // Unleash also POSTs to `.../client/metrics` under this prefix. Only the GET carries
        // toggles, and intercepting the rest just creates teardown races.
        if (request.method() !== 'GET') {
          return route.fallback();
        }

        try {
          const response = await route.fetch();
          // Not every response here carries a JSON body, so guard the whole thing rather than
          // just the `toggles` field — a throw kills Chrome's entire flag fetch.
          const body = ((await response.json().catch(() => null)) ?? {}) as { toggles?: Array<{ name: string; enabled: boolean }> };
          const toggles = (body.toggles ?? []).filter((toggle) => toggle.name !== CONVERSION_FLAG);

          toggles.push({ name: CONVERSION_FLAG, enabled: true, variant: { name: 'disabled', enabled: false } } as never);
          await route.fulfill({ response, json: { ...body, toggles } });
        } catch {
          // The page can close mid-flight as the test ends; nothing left to serve.
        }
      });
    }

    await page.goto('/');
    await page.getByRole('button', { name: 'Add widgets' }).waitFor({ state: 'visible', timeout: PAGE_LOAD_TIMEOUT_MS });

    test.skip(!(await isOrgAdmin(page)), 'test account is not an org admin, so the banner is gated off');
  });

  test.afterEach(async ({ page }) => {
    // Unleash polls in the background, so a request can still be in flight when the test
    // ends. Without this, that in-flight route callback fails the otherwise-passing test.
    await page.unrouteAll({ behavior: 'ignoreErrors' });
  });

  test('should show the conversion banner in the header for org admins', async ({ page }) => {
    // Content comes from the RBAC remote, so this doubles as proof the module resolved.
    await expect(bannerHeading(page)).toBeVisible({ timeout: PAGE_LOAD_TIMEOUT_MS });
    await expect(page.getByText(BANNER_BODY)).toBeVisible();
  });

  test('should offer both banner actions', async ({ page }) => {
    await expect(bannerHeading(page)).toBeVisible({ timeout: PAGE_LOAD_TIMEOUT_MS });

    // "Get started now" is a button, not a link — it opens the wizard in place.
    await expect(page.getByRole('button', { name: GET_STARTED })).toBeVisible();

    const learnMore = page.getByRole('link', { name: new RegExp(LEARN_MORE) });
    await expect(learnMore).toBeVisible();
    await expect(learnMore).toHaveAttribute('href', /Hybrid-Cloud-Console-Access-Management-with-Workspaces\.pdf/);
    await expect(learnMore).toHaveAttribute('target', '_blank');
    await expect(learnMore).toHaveAttribute('rel', /noopener/);
  });

  test('should render the banner above the dashboard widgets', async ({ page }) => {
    const heading = bannerHeading(page);
    await expect(heading).toBeVisible({ timeout: PAGE_LOAD_TIMEOUT_MS });

    // The banner belongs to the header, so it must sit above the widget grid rather than
    // being injected into the dashboard itself. Every widget card carries a "Widget actions"
    // menu, so the first one marks the top of the grid.
    const firstWidget = page.getByRole('button', { name: 'Widget actions' }).first();
    await expect(firstWidget).toBeVisible({ timeout: PAGE_LOAD_TIMEOUT_MS });

    const bannerBox = await heading.boundingBox();
    const widgetBox = await firstWidget.boundingBox();

    expect(bannerBox).not.toBeNull();
    expect(widgetBox).not.toBeNull();
    expect(bannerBox!.y).toBeLessThan(widgetBox!.y);
  });

  /*
   * Deliberately not covered yet: clicking "Get started now" to open the conversion wizard.
   * RBAC's `./modules/ConversionWizard` is not in rbac-ui master, so it is not deployed to
   * any environment and the click currently mounts nothing. Add that flow once it ships.
   */
});
