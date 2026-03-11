import React from 'react';
import { DashboardTable } from '../../src/Components/DashboardHub/DashboardTable/DashboardTable';
import { DashboardTemplate, TemplateConfig } from '../../src/api/dashboard-templates';

const emptyTemplateConfig: TemplateConfig = {
  sm: [],
  md: [],
  lg: [],
  xl: [],
};

const mockDashboards: DashboardTemplate[] = [
  {
    id: 1,
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-15T14:30:00Z',
    deletedAt: null,
    userIdentityID: 100,
    default: true,
    templateBase: { name: 'Base Template Alpha', displayName: 'Alpha' },
    templateConfig: emptyTemplateConfig,
    dashboardName: 'Charlie Dashboard',
  },
  {
    id: 2,
    createdAt: '2025-02-01T08:00:00Z',
    updatedAt: '2025-02-05T09:15:00Z',
    deletedAt: null,
    userIdentityID: 101,
    default: false,
    templateBase: { name: 'Base Template Beta', displayName: 'Beta' },
    templateConfig: emptyTemplateConfig,
    dashboardName: 'Alpha Dashboard',
  },
  {
    id: 3,
    createdAt: '2025-03-01T12:00:00Z',
    updatedAt: '2025-03-10T16:45:00Z',
    deletedAt: null,
    userIdentityID: 102,
    default: false,
    templateBase: { name: 'Base Template Gamma', displayName: 'Gamma' },
    templateConfig: emptyTemplateConfig,
    dashboardName: 'Bravo Dashboard',
  },
];

describe('DashboardTable', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
  });

  it('renders table with column headers', () => {
    cy.mount(<DashboardTable dashboards={mockDashboards} />);

    cy.get('th').contains('Name').should('be.visible');
    cy.get('th').contains('Description').should('be.visible');
    cy.get('th').contains('Last Modified').should('be.visible');
  });

  it('renders dashboard rows with correct data', () => {
    cy.mount(<DashboardTable dashboards={mockDashboards} />);

    cy.get('tbody tr').should('have.length', 3);

    // Default sort is ascending by name, so order should be: Alpha, Bravo, Charlie
    cy.get('tbody tr').eq(0).within(() => {
      cy.get('td[data-label="Name"]').should('contain.text', 'Alpha Dashboard');
      cy.get('td[data-label="Description"]').should('contain.text', 'Base Template Beta');
      cy.get('td[data-label="Last Modified"]').should('not.be.empty');
    });

    cy.get('tbody tr').eq(1).within(() => {
      cy.get('td[data-label="Name"]').should('contain.text', 'Bravo Dashboard');
      cy.get('td[data-label="Description"]').should('contain.text', 'Base Template Gamma');
      cy.get('td[data-label="Last Modified"]').should('not.be.empty');
    });

    cy.get('tbody tr').eq(2).within(() => {
      cy.get('td[data-label="Name"]').should('contain.text', 'Charlie Dashboard');
      cy.get('td[data-label="Description"]').should('contain.text', 'Base Template Alpha');
      cy.get('td[data-label="Last Modified"]').should('not.be.empty');
    });
  });

  it('sorts by name when the Name column header is clicked', () => {
    cy.mount(<DashboardTable dashboards={mockDashboards} />);

    // Default ascending: Alpha, Bravo, Charlie
    cy.get('tbody tr').eq(0).find('td[data-label="Name"]').should('contain.text', 'Alpha Dashboard');
    cy.get('tbody tr').eq(2).find('td[data-label="Name"]').should('contain.text', 'Charlie Dashboard');

    // Click Name header to toggle to descending
    cy.get('th').contains('Name').click();

    // Descending: Charlie, Bravo, Alpha
    cy.get('tbody tr').eq(0).find('td[data-label="Name"]').should('contain.text', 'Charlie Dashboard');
    cy.get('tbody tr').eq(1).find('td[data-label="Name"]').should('contain.text', 'Bravo Dashboard');
    cy.get('tbody tr').eq(2).find('td[data-label="Name"]').should('contain.text', 'Alpha Dashboard');

    // Click again to toggle back to ascending
    cy.get('th').contains('Name').click();

    cy.get('tbody tr').eq(0).find('td[data-label="Name"]').should('contain.text', 'Alpha Dashboard');
    cy.get('tbody tr').eq(2).find('td[data-label="Name"]').should('contain.text', 'Charlie Dashboard');
  });

  it('renders an empty table when no dashboards are provided', () => {
    cy.mount(<DashboardTable dashboards={[]} />);

    // Headers should still render
    cy.get('th').contains('Name').should('be.visible');
    cy.get('th').contains('Description').should('be.visible');
    cy.get('th').contains('Last Modified').should('be.visible');

    // No body rows
    cy.get('tbody tr').should('have.length', 0);
  });

  it('renders an actions kebab menu for each row', () => {
    cy.mount(<DashboardTable dashboards={mockDashboards} />);

    // Each row should have a kebab toggle button
    cy.get('tbody tr').each(($row) => {
      cy.wrap($row).find('button[aria-label="Kebab toggle"]').should('exist');
    });

    // Open the kebab menu on the first row and verify action items
    cy.get('tbody tr').eq(0).find('button[aria-label="Kebab toggle"]').click();
    cy.get('[role="menuitem"]').should('have.length.at.least', 4);
    cy.get('[role="menuitem"]').contains('Edit dashboard').should('exist');
    cy.get('[role="menuitem"]').contains('Set as homepage').should('exist');
    cy.get('[role="menuitem"]').contains('Copy configuration string').should('exist');
    cy.get('[role="menuitem"]').contains('Share dashboard').should('exist');
    cy.get('[role="menuitem"]').contains('Delete dashboard').should('exist');
  });
});
