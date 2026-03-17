// ***********************************************************
// This support/component.ts is processed and loaded
// automatically before your test files.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import './commands';
import { mount } from 'cypress/react';

declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
}

Cypress.Commands.add('mount', mount);
