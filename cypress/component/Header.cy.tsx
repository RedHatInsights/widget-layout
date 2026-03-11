import React from 'react';
import Header from '../../src/Components/DashboardHub/Header/Header';

describe('DashboardHub Header', () => {
  const mountHeader = () => {
    const onRefetchDashboards = cy.stub().as('onRefetchDashboards');
    cy.mount(<Header onRefetchDashboards={onRefetchDashboards} />);
  };

  it('renders "Dashboard Hub" heading', () => {
    mountHeader();
    cy.contains('h1', 'Dashboard Hub').should('be.visible');
  });

  it('shows "Page description" text', () => {
    mountHeader();
    cy.contains('Page description').should('be.visible');
  });

  it('shows "Learn more about dashboards" link', () => {
    mountHeader();
    cy.contains('a', 'Learn more about dashboards').should('be.visible');
  });

  it('"Create dashboard" dropdown button is present', () => {
    mountHeader();
    cy.contains('button', 'Create dashboard').should('be.visible');
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
        .and('be.disabled');

      cy.contains('[role="menuitem"]', 'Import from config string')
        .should('be.visible')
        .and('not.be.disabled');

      cy.contains('[role="menuitem"]', 'Duplicate existing')
        .should('be.visible')
        .and('be.disabled');
    });

    it('clicking "Import from config string" opens the import modal', () => {
      cy.contains('[role="menuitem"]', 'Import from config string').click();
      cy.get('.pf-v6-c-modal-box').should('be.visible');
    });
  });
});
