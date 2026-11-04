// ***********************************************************
// This support/component.ts is processed and loaded
// automatically before your test files.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import './commands';
import React from 'react';
import { mount } from 'cypress/react';
import { IntlProvider } from 'react-intl';

declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
}

// Wrap every CT mount in an IntlProvider so components using useIntl /
// FormattedMessage render as in production (English, defaultMessage fallback).
const mountWithIntl: typeof mount = (children, options, rerenderKey) =>
  mount(React.createElement(IntlProvider, { locale: 'en' }, children), options, rerenderKey);

Cypress.Commands.add('mount', mountWithIntl);
