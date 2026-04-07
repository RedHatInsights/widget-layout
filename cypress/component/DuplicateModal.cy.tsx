import React from 'react';
import { DuplicateModal } from '../../src/Components/DuplicateModal/DuplicateModal';
import Portal from '@redhat-cloud-services/frontend-components-notifications/Portal';
import { useAtomValue } from 'jotai';
import { notificationsAtom, useRemoveNotification } from '../../src/state/notificationsAtom';

const NotificationPortal = () => {
  const notifications = useAtomValue(notificationsAtom);
  const removeNotification = useRemoveNotification();
  return <Portal notifications={notifications} removeNotification={removeNotification} />;
};

const mockDashboards = [
  {
    id: 1,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    deletedAt: null,
    userIdentityID: 1,
    default: true,
    templateBase: { name: 'landingPage', displayName: 'Landing Page' },
    templateConfig: { sm: [], md: [], lg: [], xl: [] },
    dashboardName: 'Dashboard One',
  },
  {
    id: 2,
    createdAt: '2025-01-02',
    updatedAt: '2025-01-02',
    deletedAt: null,
    userIdentityID: 1,
    default: false,
    templateBase: { name: 'landingPage', displayName: 'Landing Page' },
    templateConfig: { sm: [], md: [], lg: [], xl: [] },
    dashboardName: 'Dashboard Two',
  },
];

const mockCopyResponse = {
  id: 99,
  createdAt: '2025-02-01T00:00:00Z',
  updatedAt: '2025-02-01T00:00:00Z',
  deletedAt: null,
  userIdentityID: 1,
  default: false,
  templateBase: { name: 'landingPage', displayName: 'Landing Page' },
  templateConfig: { sm: [], md: [], lg: [], xl: [] },
  dashboardName: 'My Duplicate',
};

describe('DuplicateModal', () => {

  it('renders modal with title when isOpen=true', () => {
    cy.mount(<DuplicateModal isOpen={true} onClose={cy.stub()} dashboards={mockDashboards} />);
    cy.contains('Duplicate existing dashboard').should('be.visible');
  });

  it('does not render modal content when isOpen=false', () => {
    cy.mount(<DuplicateModal isOpen={false} onClose={cy.stub()} dashboards={mockDashboards} />);
    cy.contains('Duplicate existing dashboard').should('not.exist');
  });

  it('shows "Duplicate dashboard" button disabled when form is empty', () => {
    cy.mount(<DuplicateModal isOpen={true} onClose={cy.stub()} dashboards={mockDashboards} />);
    cy.contains('button', 'Duplicate dashboard').should('be.visible').and('be.disabled');
  });

  it('Cancel button calls onClose', () => {
    const onClose = cy.stub().as('onClose');
    cy.mount(<DuplicateModal isOpen={true} onClose={onClose} dashboards={mockDashboards} />);
    cy.contains('button', 'Cancel').click();
    cy.get('@onClose').should('have.been.calledOnce');
  });

  it('dashboard name input is present and can be typed into', () => {
    cy.mount(<DuplicateModal isOpen={true} onClose={cy.stub()} dashboards={mockDashboards} />);
    cy.get('#duplicate-dashboard-name')
      .should('be.visible')
      .type('My Duplicate')
      .should('have.value', 'My Duplicate');
  });

  it('form labels are correct', () => {
    cy.mount(<DuplicateModal isOpen={true} onClose={cy.stub()} dashboards={mockDashboards} />);
    cy.contains('label', 'Select existing dashboard for duplication').should('be.visible');
    cy.contains('label', 'New dashboard name').should('be.visible');
    cy.contains('Set as homepage').should('be.visible');
  });

  it('checkbox is unchecked by default and can be toggled', () => {
    cy.mount(<DuplicateModal isOpen={true} onClose={cy.stub()} dashboards={mockDashboards} />);
    cy.get('#set-as-homepage').should('not.be.checked');
    cy.get('#set-as-homepage').check();
    cy.get('#set-as-homepage').should('be.checked');
    cy.get('#set-as-homepage').uncheck();
    cy.get('#set-as-homepage').should('not.be.checked');
  });

  it('dashboard select dropdown shows mocked dashboards', () => {
    cy.mount(<DuplicateModal isOpen={true} onClose={cy.stub()} dashboards={mockDashboards} />);
    cy.get('select[aria-label="Select a dashboard"]').within(() => {
      cy.get('option').should('have.length', 3); // placeholder + 2 dashboards
      cy.contains('option', 'Dashboard One').should('exist');
      cy.contains('option', 'Dashboard Two').should('exist');
    });
  });

  it('enables "Duplicate dashboard" button when both dashboard is selected AND name is entered', () => {
    cy.mount(<DuplicateModal isOpen={true} onClose={cy.stub()} dashboards={mockDashboards} />);
    cy.get('select[aria-label="Select a dashboard"]').select('1');
    cy.get('#duplicate-dashboard-name').type('My Duplicate');
    cy.contains('button', 'Duplicate dashboard').should('not.be.disabled');
  });

  it('keeps button disabled when only name is entered (no dashboard selected)', () => {
    cy.mount(<DuplicateModal isOpen={true} onClose={cy.stub()} dashboards={mockDashboards} />);
    cy.get('#duplicate-dashboard-name').type('My Duplicate');
    cy.contains('button', 'Duplicate dashboard').should('be.disabled');
  });

  it('keeps button disabled when only dashboard is selected (no name)', () => {
    cy.mount(<DuplicateModal isOpen={true} onClose={cy.stub()} dashboards={mockDashboards} />);
    cy.get('select[aria-label="Select a dashboard"]').select('1');
    cy.contains('button', 'Duplicate dashboard').should('be.disabled');
  });

  it('keeps button disabled when name is whitespace only', () => {
    cy.mount(<DuplicateModal isOpen={true} onClose={cy.stub()} dashboards={mockDashboards} />);
    cy.get('select[aria-label="Select a dashboard"]').select('1');
    cy.get('#duplicate-dashboard-name').type('   ');
    cy.contains('button', 'Duplicate dashboard').should('be.disabled');
  });

  describe('Successful duplication', () => {
    it('calls copy API, shows success notification, calls onSuccess and onClose', () => {
      cy.intercept('POST', '/api/widget-layout/v1/1/copy', {
        statusCode: 200,
        body: mockCopyResponse,
      }).as('copyDashboard');

      const onClose = cy.stub().as('onClose');
      const onSuccess = cy.stub().as('onSuccess');

      cy.mount(
        <>
          <NotificationPortal />
          <DuplicateModal isOpen={true} onClose={onClose} onSuccess={onSuccess} dashboards={mockDashboards} />
        </>
      );

      cy.get('select[aria-label="Select a dashboard"]').select('1');
      cy.get('#duplicate-dashboard-name').type('My Duplicate');
      cy.contains('button', 'Duplicate dashboard').click();

      cy.wait('@copyDashboard');

      cy.get('@onSuccess').should('have.been.calledOnce');
      cy.get('@onClose').should('have.been.calledOnce');
      cy.get('.pf-v6-c-alert').should('contain.text', "Dashboard 'My Duplicate' duplicated successfully");
    });

    it('calls setDefaultTemplate API when "Set as homepage" is checked', () => {
      cy.intercept('POST', '/api/widget-layout/v1/1/copy', {
        statusCode: 200,
        body: mockCopyResponse,
      }).as('copyDashboard');

      cy.intercept('POST', '/api/widget-layout/v1/99/default', {
        statusCode: 200,
        body: { ...mockCopyResponse, default: true },
      }).as('setDefault');

      const onClose = cy.stub().as('onClose');

      cy.mount(
        <>
          <NotificationPortal />
          <DuplicateModal isOpen={true} onClose={onClose} onSuccess={cy.stub()} dashboards={mockDashboards} />
        </>
      );

      cy.get('select[aria-label="Select a dashboard"]').select('1');
      cy.get('#duplicate-dashboard-name').type('My Duplicate');
      cy.get('#set-as-homepage').check();
      cy.contains('button', 'Duplicate dashboard').click();

      cy.wait('@copyDashboard');
      cy.wait('@setDefault');

      cy.get('@onClose').should('have.been.calledOnce');
    });

    it('does not call setDefaultTemplate when checkbox is unchecked', () => {
      cy.intercept('POST', '/api/widget-layout/v1/1/copy', {
        statusCode: 200,
        body: mockCopyResponse,
      }).as('copyDashboard');

      cy.intercept('POST', '/api/widget-layout/v1/99/default', {
        statusCode: 200,
        body: { ...mockCopyResponse, default: true },
      }).as('setDefault');

      cy.mount(
        <>
          <NotificationPortal />
          <DuplicateModal isOpen={true} onClose={cy.stub()} onSuccess={cy.stub()} dashboards={mockDashboards} />
        </>
      );

      cy.get('select[aria-label="Select a dashboard"]').select('1');
      cy.get('#duplicate-dashboard-name').type('My Duplicate');
      cy.contains('button', 'Duplicate dashboard').click();

      cy.wait('@copyDashboard');

      // Ensure setDefault was NOT called
      cy.get('@setDefault.all').should('have.length', 0);
    });
  });

  describe('Loading state', () => {
    it('shows "Duplicating..." and disables buttons during submission', () => {
      cy.intercept('POST', '/api/widget-layout/v1/1/copy', {
        statusCode: 200,
        body: mockCopyResponse,
        delay: 1000,
      }).as('copyDashboard');

      cy.mount(<DuplicateModal isOpen={true} onClose={cy.stub()} dashboards={mockDashboards} />);

      cy.get('select[aria-label="Select a dashboard"]').select('1');
      cy.get('#duplicate-dashboard-name').type('My Duplicate');
      cy.contains('button', 'Duplicate dashboard').click();

      // While loading
      cy.contains('button', 'Duplicating...').should('be.visible').and('be.disabled');
      cy.contains('button', 'Cancel').should('be.disabled');
    });
  });

  describe('Error handling', () => {
    it('shows error alert for 500+ status', () => {
      cy.intercept('POST', '/api/widget-layout/v1/1/copy', {
        statusCode: 500,
        body: 'Internal Server Error',
      }).as('copyDashboard');

      cy.mount(<DuplicateModal isOpen={true} onClose={cy.stub()} dashboards={mockDashboards} />);

      cy.get('select[aria-label="Select a dashboard"]').select('1');
      cy.get('#duplicate-dashboard-name').type('My Duplicate');
      cy.contains('button', 'Duplicate dashboard').click();

      cy.wait('@copyDashboard');

      cy.get('.pf-v6-c-alert').should('contain.text', 'The server is currently unavailable. Please try again later.');
    });

    it('shows error alert for non-500 errors', () => {
      cy.intercept('POST', '/api/widget-layout/v1/1/copy', {
        statusCode: 400,
        body: 'Bad Request',
      }).as('copyDashboard');

      cy.mount(<DuplicateModal isOpen={true} onClose={cy.stub()} dashboards={mockDashboards} />);

      cy.get('select[aria-label="Select a dashboard"]').select('1');
      cy.get('#duplicate-dashboard-name').type('My Duplicate');
      cy.contains('button', 'Duplicate dashboard').click();

      cy.wait('@copyDashboard');

      cy.get('.pf-v6-c-alert').should('contain.text', 'Failed to duplicate dashboard. Please try again.');
    });

    it('re-enables form after error', () => {
      cy.intercept('POST', '/api/widget-layout/v1/1/copy', {
        statusCode: 500,
        body: 'Internal Server Error',
      }).as('copyDashboard');

      cy.mount(<DuplicateModal isOpen={true} onClose={cy.stub()} dashboards={mockDashboards} />);

      cy.get('select[aria-label="Select a dashboard"]').select('1');
      cy.get('#duplicate-dashboard-name').type('My Duplicate');
      cy.contains('button', 'Duplicate dashboard').click();

      cy.wait('@copyDashboard');

      // After error, buttons should be re-enabled
      cy.contains('button', 'Duplicate dashboard').should('not.be.disabled');
      cy.contains('button', 'Cancel').should('not.be.disabled');
    });
  });
});