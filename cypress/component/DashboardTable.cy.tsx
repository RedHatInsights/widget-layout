import React from 'react';
import FlagProvider from '@unleash/proxy-client-react';
import { UnleashClient } from 'unleash-proxy-client';
import { DashboardTable } from '../../src/Components/DashboardHub/DashboardTable/DashboardTable';
import { DashboardTemplate, TemplateConfig } from '../../src/api/dashboard-templates';
import Portal from '@redhat-cloud-services/frontend-components-notifications/Portal';
import { useAtomValue } from 'jotai';
import { notificationsAtom, useRemoveNotification } from '../../src/state/notificationsAtom';

const NotificationPortal = () => {
  const notifications = useAtomValue(notificationsAtom);
  const removeNotification = useRemoveNotification();
  return <Portal notifications={notifications} removeNotification={removeNotification} />;
};

const createMockClient = (flagEnabled: boolean) => {
  const client = new UnleashClient({
    url: 'http://api/frontend',
    clientKey: 'test',
    appName: 'test',
  });
  client.isEnabled = () => flagEnabled;
  return client;
};

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
    cy.mount(<DashboardTable dashboards={mockDashboards} onRefetchDashboards={cy.stub()} />);

    cy.get('th').contains('Name').should('be.visible');
    cy.get('th').contains('Description').should('be.visible');
    cy.get('th').contains('Last Modified').should('be.visible');
  });

  it('renders dashboard rows with correct data', () => {
    cy.mount(<DashboardTable dashboards={mockDashboards} onRefetchDashboards={cy.stub()} />);

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
    cy.mount(<DashboardTable dashboards={mockDashboards} onRefetchDashboards={cy.stub()} />);

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
    cy.mount(<DashboardTable dashboards={[]} onRefetchDashboards={cy.stub()} />);

    // Headers should still render
    cy.get('th').contains('Name').should('be.visible');
    cy.get('th').contains('Description').should('be.visible');
    cy.get('th').contains('Last Modified').should('be.visible');

    // No body rows
    cy.get('tbody tr').should('have.length', 0);
  });

  it('renders an actions kebab menu for each row', () => {
    cy.mount(<DashboardTable dashboards={mockDashboards} onRefetchDashboards={cy.stub()} />);

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

  describe('Delete dashboard', () => {
    it('"Delete dashboard" is disabled when feature flag is off', () => {
      cy.mount(
        <FlagProvider unleashClient={createMockClient(false)} startClient={false}>
          <DashboardTable dashboards={mockDashboards} onRefetchDashboards={cy.stub()} />
        </FlagProvider>
      );

      cy.get('tbody tr').eq(0).find('button[aria-label="Kebab toggle"]').click();
      cy.get('[role="menuitem"]').contains('Delete dashboard')
        .closest('button')
        .should('be.disabled');
    });

    it('"Delete dashboard" is enabled when feature flag is on', () => {
      cy.mount(
        <FlagProvider unleashClient={createMockClient(true)} startClient={false}>
          <DashboardTable dashboards={mockDashboards} onRefetchDashboards={cy.stub()} />
        </FlagProvider>
      );

      cy.get('tbody tr').eq(0).find('button[aria-label="Kebab toggle"]').click();
      cy.get('[role="menuitem"]').contains('Delete dashboard')
        .closest('button')
        .should('not.be.disabled');
    });

    it('shows delete modal with correct dashboard name', () => {
      cy.mount(
        <FlagProvider unleashClient={createMockClient(true)} startClient={false}>
          <DashboardTable dashboards={mockDashboards} onRefetchDashboards={cy.stub()} />
        </FlagProvider>
      );

      // Alpha Dashboard is at index 0 after default ascending sort
      cy.get('tbody tr').eq(0).find('button[aria-label="Kebab toggle"]').click();
      cy.get('[role="menuitem"]').contains('Delete dashboard').click();

      cy.get('#delete-dashboard-modal-title').should('contain.text', "Delete 'Alpha Dashboard' dashboard");
    });

    it('checkbox is unchecked by default when modal opens', () => {
      cy.mount(
        <FlagProvider unleashClient={createMockClient(true)} startClient={false}>
          <DashboardTable dashboards={mockDashboards} onRefetchDashboards={cy.stub()} />
        </FlagProvider>
      );

      cy.get('tbody tr').eq(0).find('button[aria-label="Kebab toggle"]').click();
      cy.get('[role="menuitem"]').contains('Delete dashboard').click();

      cy.get('#delete-confirm').should('not.be.checked');
    });

    it('checkbox is unchecked after closing and reopening modal', () => {
      cy.mount(
        <FlagProvider unleashClient={createMockClient(true)} startClient={false}>
          <DashboardTable dashboards={mockDashboards} onRefetchDashboards={cy.stub()} />
        </FlagProvider>
      );

      // Open modal and check the checkbox
      cy.get('tbody tr').eq(0).find('button[aria-label="Kebab toggle"]').click();
      cy.get('[role="menuitem"]').contains('Delete dashboard').click();
      cy.get('#delete-confirm').check();
      cy.get('#delete-confirm').should('be.checked');

      // Close modal via Cancel button
      cy.get('button').contains('Cancel').click();

      // Reopen modal
      cy.get('tbody tr').eq(0).find('button[aria-label="Kebab toggle"]').click();
      cy.get('[role="menuitem"]').contains('Delete dashboard').click();

      // Checkbox should be unchecked again
      cy.get('#delete-confirm').should('not.be.checked');
    });

    it('delete button in modal is disabled until checkbox is checked', () => {
      cy.mount(
        <FlagProvider unleashClient={createMockClient(true)} startClient={false}>
          <DashboardTable dashboards={mockDashboards} onRefetchDashboards={cy.stub()} />
        </FlagProvider>
      );

      cy.get('tbody tr').eq(0).find('button[aria-label="Kebab toggle"]').click();
      cy.get('[role="menuitem"]').contains('Delete dashboard').click();

      // Delete button should be disabled when checkbox is unchecked
      cy.get('.delete-dashboard-modal button').contains('Delete dashboard').closest('button').should('be.disabled');

      // Check the checkbox
      cy.get('#delete-confirm').check();

      // Delete button should be enabled
      cy.get('.delete-dashboard-modal button').contains('Delete dashboard').closest('button').should('not.be.disabled');

      // Uncheck the checkbox
      cy.get('#delete-confirm').uncheck();

      // Delete button should be disabled again
      cy.get('.delete-dashboard-modal button').contains('Delete dashboard').closest('button').should('be.disabled');
    });

    it('shows success alert after deleting a dashboard', () => {
      cy.intercept('DELETE', '/api/widget-layout/v1/*', {
        statusCode: 204,
        body: '',
      }).as('deleteDashboard');

      const refetchStub = cy.stub();

      cy.mount(
        <FlagProvider unleashClient={createMockClient(true)} startClient={false}>
          <NotificationPortal />
          <DashboardTable dashboards={mockDashboards} onRefetchDashboards={refetchStub} />
        </FlagProvider>
      );

      // Open kebab and click Delete
      cy.get('tbody tr').eq(0).find('button[aria-label="Kebab toggle"]').click();
      cy.get('[role="menuitem"]').contains('Delete dashboard').click();

      // Confirm deletion
      cy.get('#delete-confirm').check();
      cy.get('.delete-dashboard-modal button').contains('Delete dashboard').click();

      cy.wait('@deleteDashboard');

      // Verify the success alert appears with the correct dashboard name
      cy.get('.pf-v6-c-alert').should('contain.text', "'Alpha Dashboard' has been deleted and removed from Dashboard Hub");
    });
  });
});
