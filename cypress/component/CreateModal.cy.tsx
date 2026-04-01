import React from 'react';
import { CreateModal } from '../../src/Components/CreateModal/CreateModal';
import Portal from '@redhat-cloud-services/frontend-components-notifications/Portal';
import { useAtomValue } from 'jotai';
import { notificationsAtom, useRemoveNotification } from '../../src/state/notificationsAtom';

const NotificationPortal = () => {
  const notifications = useAtomValue(notificationsAtom);
  const removeNotification = useRemoveNotification();
  return <Portal notifications={notifications} removeNotification={removeNotification} />;
};

const mockDashboardResponse = {
  id: 42,
  createdAt: '2025-01-10T10:00:00Z',
  updatedAt: '2025-01-10T10:00:00Z',
  deletedAt: null,
  userIdentityID: 100,
  default: false,
  templateBase: { name: 'landingPage', displayName: 'Landing Page' },
  templateConfig: { sm: [], md: [], lg: [], xl: [] },
  dashboardName: 'My Dashboard',
};

describe('CreateModal', () => {
  it('renders modal with title when isOpen=true', () => {
    cy.mount(<CreateModal isOpen={true} onClose={cy.stub()} />);
    cy.contains('Create new blank dashboard').should('be.visible');
  });

  it('does not render modal content when isOpen=false', () => {
    cy.mount(<CreateModal isOpen={false} onClose={cy.stub()} />);
    cy.contains('Create new blank dashboard').should('not.exist');
  });

  it('shows "Create dashboard" button which is disabled when name is empty', () => {
    cy.mount(<CreateModal isOpen={true} onClose={cy.stub()} />);
    cy.contains('button', 'Create dashboard').should('be.visible').and('be.disabled');
  });

  it('enables "Create dashboard" button when name is entered', () => {
    cy.mount(<CreateModal isOpen={true} onClose={cy.stub()} />);
    cy.get('#blank-dashboard-name').type('My Dashboard');
    cy.contains('button', 'Create dashboard').should('not.be.disabled');
  });

  it('keeps button disabled when name is only whitespace', () => {
    cy.mount(<CreateModal isOpen={true} onClose={cy.stub()} />);
    cy.get('#blank-dashboard-name').type('   ');
    cy.contains('button', 'Create dashboard').should('be.disabled');
  });

  it('Cancel button calls onClose', () => {
    const onClose = cy.stub().as('onClose');
    cy.mount(<CreateModal isOpen={true} onClose={onClose} />);
    cy.contains('button', 'Cancel').click();
    cy.get('@onClose').should('have.been.calledOnce');
  });

  it('dashboard name input is present and can be typed into', () => {
    cy.mount(<CreateModal isOpen={true} onClose={cy.stub()} />);
    cy.get('#blank-dashboard-name')
      .should('be.visible')
      .type('My New Dashboard')
      .should('have.value', 'My New Dashboard');
  });

  it('form labels are correct', () => {
    cy.mount(<CreateModal isOpen={true} onClose={cy.stub()} />);
    cy.contains('label', 'New dashboard name').should('be.visible');
    cy.contains('Set as homepage').should('be.visible');
  });

  it('checkbox is unchecked by default', () => {
    cy.mount(<CreateModal isOpen={true} onClose={cy.stub()} />);
    cy.get('#set-as-homepage').should('not.be.checked');
  });

  it('checkbox can be toggled', () => {
    cy.mount(<CreateModal isOpen={true} onClose={cy.stub()} />);
    cy.get('#set-as-homepage').check();
    cy.get('#set-as-homepage').should('be.checked');
    cy.get('#set-as-homepage').uncheck();
    cy.get('#set-as-homepage').should('not.be.checked');
  });

  describe('Successful creation', () => {
    it('calls import API and closes modal on success', () => {
      cy.intercept('POST', '/api/widget-layout/v1/import', {
        statusCode: 200,
        body: mockDashboardResponse,
      }).as('importDashboard');

      const onClose = cy.stub().as('onClose');
      const onSuccess = cy.stub().as('onSuccess');

      cy.mount(
        <>
          <NotificationPortal />
          <CreateModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />
        </>
      );

      cy.get('#blank-dashboard-name').type('My Dashboard');
      cy.contains('button', 'Create dashboard').click();

      cy.wait('@importDashboard');

      cy.get('@onSuccess').should('have.been.calledOnce');
      cy.get('@onClose').should('have.been.calledOnce');
    });

    it('shows success notification after creation', () => {
      cy.intercept('POST', '/api/widget-layout/v1/import', {
        statusCode: 200,
        body: mockDashboardResponse,
      }).as('importDashboard');

      cy.mount(
        <>
          <NotificationPortal />
          <CreateModal isOpen={true} onClose={cy.stub()} onSuccess={cy.stub()} />
        </>
      );

      cy.get('#blank-dashboard-name').type('My Dashboard');
      cy.contains('button', 'Create dashboard').click();

      cy.wait('@importDashboard');

      cy.get('.pf-v6-c-alert').should('contain.text', "Dashboard 'My Dashboard' created successfully");
    });

    it('calls setDefaultTemplate when "Set as homepage" is checked', () => {
      cy.intercept('POST', '/api/widget-layout/v1/import', {
        statusCode: 200,
        body: mockDashboardResponse,
      }).as('importDashboard');

      cy.intercept('POST', '/api/widget-layout/v1/42/default', {
        statusCode: 200,
        body: { ...mockDashboardResponse, default: true },
      }).as('setDefault');

      const onClose = cy.stub().as('onClose');

      cy.mount(
        <>
          <NotificationPortal />
          <CreateModal isOpen={true} onClose={onClose} onSuccess={cy.stub()} />
        </>
      );

      cy.get('#blank-dashboard-name').type('My Dashboard');
      cy.get('#set-as-homepage').check();
      cy.contains('button', 'Create dashboard').click();

      cy.wait('@importDashboard');
      cy.wait('@setDefault');

      cy.get('@onClose').should('have.been.calledOnce');
    });

    it('does not call setDefaultTemplate when checkbox is unchecked', () => {
      cy.intercept('POST', '/api/widget-layout/v1/import', {
        statusCode: 200,
        body: mockDashboardResponse,
      }).as('importDashboard');

      cy.intercept('POST', '/api/widget-layout/v1/42/default', {
        statusCode: 200,
        body: { ...mockDashboardResponse, default: true },
      }).as('setDefault');

      cy.mount(
        <>
          <NotificationPortal />
          <CreateModal isOpen={true} onClose={cy.stub()} onSuccess={cy.stub()} />
        </>
      );

      cy.get('#blank-dashboard-name').type('My Dashboard');
      cy.contains('button', 'Create dashboard').click();

      cy.wait('@importDashboard');

      // Ensure setDefault was NOT called
      cy.get('@setDefault.all').should('have.length', 0);
    });
  });

  describe('Loading state', () => {
    it('shows loading state and disables buttons during submission', () => {
      cy.intercept('POST', '/api/widget-layout/v1/import', {
        statusCode: 200,
        body: mockDashboardResponse,
        delay: 1000,
      }).as('importDashboard');

      cy.mount(<CreateModal isOpen={true} onClose={cy.stub()} />);

      cy.get('#blank-dashboard-name').type('My Dashboard');
      cy.contains('button', 'Create dashboard').click();

      // While loading
      cy.contains('button', 'Creating...').should('be.visible').and('be.disabled');
      cy.contains('button', 'Cancel').should('be.disabled');
    });
  });

  describe('Error handling', () => {
    it('shows server error message for 500+ status', () => {
      cy.intercept('POST', '/api/widget-layout/v1/import', {
        statusCode: 500,
        body: 'Internal Server Error',
      }).as('importDashboard');

      cy.mount(<CreateModal isOpen={true} onClose={cy.stub()} />);

      cy.get('#blank-dashboard-name').type('My Dashboard');
      cy.contains('button', 'Create dashboard').click();

      cy.wait('@importDashboard');

      cy.get('.pf-v6-c-alert').should('contain.text', 'The server is currently unavailable. Please try again later.');
    });

    it('shows generic API error for non-500 errors', () => {
      cy.intercept('POST', '/api/widget-layout/v1/import', {
        statusCode: 400,
        body: 'Bad Request',
      }).as('importDashboard');

      cy.mount(<CreateModal isOpen={true} onClose={cy.stub()} />);

      cy.get('#blank-dashboard-name').type('My Dashboard');
      cy.contains('button', 'Create dashboard').click();

      cy.wait('@importDashboard');

      cy.get('.pf-v6-c-alert').should('contain.text', 'Failed to create dashboard. Please try again.');
    });

    it('shows error message on network failure', () => {
      cy.intercept('POST', '/api/widget-layout/v1/import', {
        forceNetworkError: true,
      }).as('importDashboard');

      cy.mount(<CreateModal isOpen={true} onClose={cy.stub()} />);

      cy.get('#blank-dashboard-name').type('My Dashboard');
      cy.contains('button', 'Create dashboard').click();

      cy.get('.pf-v6-c-alert').should('contain.text', 'Network error. Please check your connection and try again.');
    });

    it('re-enables form after error', () => {
      cy.intercept('POST', '/api/widget-layout/v1/import', {
        statusCode: 500,
        body: 'Internal Server Error',
      }).as('importDashboard');

      cy.mount(<CreateModal isOpen={true} onClose={cy.stub()} />);

      cy.get('#blank-dashboard-name').type('My Dashboard');
      cy.contains('button', 'Create dashboard').click();

      cy.wait('@importDashboard');

      // After error, buttons should be re-enabled
      cy.contains('button', 'Create dashboard').should('not.be.disabled');
      cy.contains('button', 'Cancel').should('not.be.disabled');
    });
  });
});
