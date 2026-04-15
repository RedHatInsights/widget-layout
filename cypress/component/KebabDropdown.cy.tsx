import React from 'react';
import { KebabDropdown } from '../../src/Components/Header/Header';
import { MemoryRouter } from 'react-router-dom';
import { DashboardTemplate } from '../../src/api/dashboard-templates';

const mockDashboards: DashboardTemplate[] = [
  {
    id: 1,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    deletedAt: null,
    userIdentityID: 1,
    default: false,
    templateBase: { name: 'test', displayName: 'Test' },
    templateConfig: { sm: [], md: [], lg: [], xl: [] },
    dashboardName: 'My Dashboard',
  },
];

describe('KebabDropdown', () => {
  beforeEach(() => {
    cy.mount(
      <MemoryRouter>
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px' }}>
          <KebabDropdown dashboards={mockDashboards} />
        </div>
      </MemoryRouter>
    );
  });

  it('renders the kebab toggle button', () => {
    cy.get('button[aria-label="kebab dropdown toggle"]').should('be.visible');
  });

  it('opens the dropdown menu on toggle click', () => {
    cy.get('button[aria-label="kebab dropdown toggle"]').click();
    cy.get('[role="menu"]').should('be.visible');
  });

  it('displays all dropdown items', () => {
    cy.get('button[aria-label="kebab dropdown toggle"]').click();

    cy.contains('[role="menuitem"]', 'My Dashboard').should('be.visible');
    cy.contains('[role="menuitem"]', 'Create new dashboard').should('be.visible');
    cy.contains('[role="menuitem"]', 'Dashboard Hub').should('be.visible');
  });

  it('has Dashboard Hub item enabled with correct link', () => {
    cy.get('button[aria-label="kebab dropdown toggle"]').click();

    cy.contains('[role="menuitem"]', 'Dashboard Hub')
      .should('not.be.disabled')
      .should('have.attr', 'href', '/dashboard-hub');
  });

  it('toggle button has expanded state when open', () => {
    cy.get('button[aria-label="kebab dropdown toggle"]').should('have.attr', 'aria-expanded', 'false');
    cy.get('button[aria-label="kebab dropdown toggle"]').click();
    cy.get('button[aria-label="kebab dropdown toggle"]').should('have.attr', 'aria-expanded', 'true');
  });

  it('renders dashboard items with correct links', () => {
    cy.get('button[aria-label="kebab dropdown toggle"]').click();

    cy.contains('[role="menuitem"]', 'My Dashboard').should('have.attr', 'href', '/dashboard-hub/1');
  });

  it('drills into Create new dashboard submenu and displays options', () => {
    cy.get('button[aria-label="kebab dropdown toggle"]').click();
    cy.contains('[role="menuitem"]', 'Create new dashboard').click();

    cy.contains('[role="menuitem"]', 'Create from blank').should('be.visible');
    cy.contains('[role="menuitem"]', 'Import from config string').should('be.visible');
    cy.contains('[role="menuitem"]', 'Duplicate existing').should('be.visible');
  });

  it('drills back from Create new dashboard submenu', () => {
    cy.get('button[aria-label="kebab dropdown toggle"]').click();
    cy.contains('[role="menuitem"]', 'Create new dashboard').click();

    // Click the breadcrumb back button to drill out
    cy.get('#kebab-drilldownMenuCreate').contains('[role="menuitem"]', 'Create new dashboard').click();

    // Root menu items should be visible again
    cy.contains('[role="menuitem"]', 'My Dashboard').should('be.visible');
    cy.contains('[role="menuitem"]', 'Dashboard Hub').should('be.visible');
  });
});