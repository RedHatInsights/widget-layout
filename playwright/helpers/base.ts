import { test as base } from '@playwright/test';

// Extend the base test to block TrustArc cookie consent scripts globally
export const test = base.extend({
  context: async ({ context }, use) => {
    await context.route('**/static*.redhat.com/libs/redhat/marketing/latest/trustarc/trustarc*.js', (route) =>
      route.abort()
    );
    await context.route('**/consent.trustarc.com/**', (route) =>
      route.abort()
    );
    await use(context);
  },
});

export { expect } from '@playwright/test';
