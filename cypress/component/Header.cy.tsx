import React from 'react';
import FlagProvider from '@unleash/proxy-client-react';
import { UnleashClient } from 'unleash-proxy-client';
import { MemoryRouter } from 'react-router-dom';
import Header from '../../src/Components/DashboardHub/Header/Header';

const createMockClient = (flagEnabled: boolean) => {
  const client = new UnleashClient({
    url: 'http://api/frontend',
    clientKey: 'test',
    appName: 'test',
  });
  client.isEnabled = () => flagEnabled;
  return client;
};

describe('DashboardHub Header', () => {
  const mountHeader = (flagEnabled = false) => {
    const onRefetchDashboards = cy.stub().as('onRefetchDashboards');
    cy.mount(
      <MemoryRouter>
        <FlagProvider unleashClient={createMockClient(flagEnabled)} startClient={false}>
          <Header onRefetchDashboards={onRefetchDashboards} dashboards={[]} />
        </FlagProvider>
      </MemoryRouter>
    );
  };

  it('renders "Dashboard Hub" heading', () => {
    mountHeader();
    cy.contains('h1', 'Dashboard Hub').should('be.visible');
  });

  it('shows page description text', () => {
    mountHeader();
    cy.contains('Manage, customize, and organize your dashboards').should('be.visible');
  });

  it('shows "Learn more about dashboards" link when feature flag is enabled', () => {
    mountHeader(true);
    cy.contains('a', 'Learn more about dashboards').should('be.visible');
  });

  it('hides "Learn more about dashboards" link when feature flag is disabled', () => {
    mountHeader();
    cy.contains('a', 'Learn more about dashboards').should('not.exist');
  });

  it('"Create dashboard" dropdown button is present', () => {
    mountHeader();
    cy.contains('button', 'Create dashboard').should('be.visible');
  });

  it('renders breadcrumb navigation', () => {
    mountHeader();
    cy.get('.pf-v6-c-breadcrumb').should('be.visible');
    cy.contains('.pf-v6-c-breadcrumb__item', 'Home').should('be.visible');
    cy.contains('.pf-v6-c-breadcrumb__item', 'Dashboard Hub').should('be.visible');
  });

  describe('Create dashboard dropdown', () => {
    beforeEach(() => {
      mountHeader();
      cy.contains('button', 'Create dashboard').click();
    });

    it('opens dropdown with correct items and disabled states', () => {
      cy.get('[data-ouia-component-id="CreateDashboardDropdown"]').should('be.visible');

      cy.contains('[role="menuitem"]', 'Create from blank')
        .should('be.visible')

      cy.contains('[role="menuitem"]', 'Import from config string')
        .should('be.visible')

      cy.contains('[role="menuitem"]', 'Duplicate existing')
        .should('be.visible')
    });

    it('clicking "Import from config string" opens the import modal', () => {
      cy.contains('[role="menuitem"]', 'Import from config string').click();
      cy.get('.pf-v6-c-modal-box').should('be.visible');
    });
  });
});
