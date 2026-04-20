import React from 'react';
import GenericHeader from '../../src/Components/GenericHeader/GenericHeader';
import { MemoryRouter } from 'react-router-dom';
import { DashboardTemplate } from '../../src/api/dashboard-templates';

const mockDashboard: DashboardTemplate = {
  id: 1,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  deletedAt: null,
  userIdentityID: 1,
  default: false,
  templateBase: { name: 'test', displayName: 'Test' },
  templateConfig: { sm: [], md: [], lg: [], xl: [] },
  dashboardName: 'My Dashboard',
};

describe('GenericHeader', () => {
  describe('without dashboard', () => {
    it('renders "Add widgets" button', () => {
      cy.mount(
        <MemoryRouter>
          <GenericHeader onRenameDashboard={cy.stub()} />
        </MemoryRouter>
      );
      cy.get('[data-ouia-component-id="add-widget-button"]').should('be.visible').and('contain.text', 'Add widgets');
    });

    it('does not render edit name button when no dashboard', () => {
      cy.mount(
        <MemoryRouter>
          <GenericHeader onRenameDashboard={cy.stub()} />
        </MemoryRouter>
      );
      cy.get('button[aria-label="Edit dashboard name"]').should('not.exist');
    });

    it('does not render kebab dropdown when no dashboard', () => {
      cy.mount(
        <MemoryRouter>
          <GenericHeader onRenameDashboard={cy.stub()} />
        </MemoryRouter>
      );
      cy.get('button[aria-label="kebab dropdown toggle"]').should('not.exist');
    });
  });

  describe('with dashboard', () => {
    const mountHeader = (onRenameDashboard = cy.stub().resolves()) => {
      cy.mount(
        <MemoryRouter>
          <GenericHeader dashboard={mockDashboard} onRenameDashboard={onRenameDashboard} />
        </MemoryRouter>
      );
    };

    it('renders the dashboard name', () => {
      mountHeader();
      cy.contains('h1', 'My Dashboard').should('be.visible');
    });

    it('renders "Add widgets" button', () => {
      mountHeader();
      cy.get('[data-ouia-component-id="add-widget-button"]').should('be.visible');
    });

    it('renders the edit name button', () => {
      mountHeader();
      cy.get('button[aria-label="Edit dashboard name"]').should('be.visible');
    });

    it('renders the kebab dropdown', () => {
      mountHeader();
      cy.get('button[aria-label="kebab dropdown toggle"]').should('be.visible');
    });

    describe('inline editing', () => {
      it('enters edit mode when pencil icon is clicked', () => {
        mountHeader();
        cy.get('button[aria-label="Edit dashboard name"]').click();
        cy.get('input[aria-label="Dashboard name"]').should('be.visible').and('have.value', 'My Dashboard');
      });

      it('shows confirm and cancel buttons in edit mode', () => {
        mountHeader();
        cy.get('button[aria-label="Edit dashboard name"]').click();
        cy.get('button[aria-label="Confirm name"]').should('be.visible');
        cy.get('button[aria-label="Cancel editing"]').should('be.visible');
      });

      it('hides the dashboard name heading in edit mode', () => {
        mountHeader();
        cy.get('button[aria-label="Edit dashboard name"]').click();
        cy.contains('h1', 'My Dashboard').should('not.exist');
      });

      it('calls onRenameDashboard with new name on confirm click', () => {
        const onRenameDashboard = cy.stub().as('onRenameDashboard').resolves();
        mountHeader(onRenameDashboard);

        cy.get('button[aria-label="Edit dashboard name"]').click();
        cy.get('input[aria-label="Dashboard name"]').clear().type('Renamed Dashboard');
        cy.get('button[aria-label="Confirm name"]').click();

        cy.get('@onRenameDashboard').should('have.been.calledOnceWith', 'Renamed Dashboard');
      });

      it('calls onRenameDashboard on Enter key', () => {
        const onRenameDashboard = cy.stub().as('onRenameDashboard').resolves();
        mountHeader(onRenameDashboard);

        cy.get('button[aria-label="Edit dashboard name"]').click();
        cy.get('input[aria-label="Dashboard name"]').clear().type('Enter Dashboard{enter}');

        cy.get('@onRenameDashboard').should('have.been.calledOnceWith', 'Enter Dashboard');
      });

      it('cancels editing and restores original name on cancel click', () => {
        mountHeader();

        cy.get('button[aria-label="Edit dashboard name"]').click();
        cy.get('input[aria-label="Dashboard name"]').clear().type('Something else');
        cy.get('button[aria-label="Cancel editing"]').click();

        cy.contains('h1', 'My Dashboard').should('be.visible');
        cy.get('input[aria-label="Dashboard name"]').should('not.exist');
      });

      it('cancels editing on Escape key', () => {
        mountHeader();

        cy.get('button[aria-label="Edit dashboard name"]').click();
        cy.get('input[aria-label="Dashboard name"]').clear().type('Something else{esc}');

        cy.contains('h1', 'My Dashboard').should('be.visible');
        cy.get('input[aria-label="Dashboard name"]').should('not.exist');
      });

      it('does not call onRenameDashboard when name is empty', () => {
        const onRenameDashboard = cy.stub().as('onRenameDashboard').resolves();
        mountHeader(onRenameDashboard);

        cy.get('button[aria-label="Edit dashboard name"]').click();
        cy.get('input[aria-label="Dashboard name"]').clear();
        cy.get('button[aria-label="Confirm name"]').click();

        cy.get('@onRenameDashboard').should('not.have.been.called');
      });

      it('trims whitespace from the new name', () => {
        const onRenameDashboard = cy.stub().as('onRenameDashboard').resolves();
        mountHeader(onRenameDashboard);

        cy.get('button[aria-label="Edit dashboard name"]').click();
        cy.get('input[aria-label="Dashboard name"]').clear().type('  Trimmed Name  ');
        cy.get('button[aria-label="Confirm name"]').click();

        cy.get('@onRenameDashboard').should('have.been.calledOnceWith', 'Trimmed Name');
      });

      it('exits edit mode after successful rename', () => {
        const onRenameDashboard = cy.stub().as('onRenameDashboard').resolves();
        mountHeader(onRenameDashboard);

        cy.get('button[aria-label="Edit dashboard name"]').click();
        cy.get('input[aria-label="Dashboard name"]').clear().type('New Name');
        cy.get('button[aria-label="Confirm name"]').click();

        cy.get('input[aria-label="Dashboard name"]').should('not.exist');
        cy.get('button[aria-label="Edit dashboard name"]').should('be.visible');
      });
    });

    describe('kebab dropdown', () => {
      it('opens the dropdown menu on toggle click', () => {
        mountHeader();
        cy.get('button[aria-label="kebab dropdown toggle"]').click();
        cy.get('[role="menu"]').should('be.visible');
      });

      it('displays all menu items', () => {
        mountHeader();
        cy.get('button[aria-label="kebab dropdown toggle"]').click();

        cy.contains('[role="menuitem"]', 'Set as homepage').should('be.visible');
        cy.contains('[role="menuitem"]', 'Duplicate').should('be.visible');
        cy.contains('[role="menuitem"]', 'Copy configuration string').should('be.visible');
        cy.contains('[role="menuitem"]', 'Delete dashboard').should('be.visible');
      });

      it('opens delete modal when Delete dashboard is clicked', () => {
        mountHeader();
        cy.get('button[aria-label="kebab dropdown toggle"]').click();
        cy.contains('[role="menuitem"]', 'Delete dashboard').click();

        cy.get('.pf-v6-c-modal-box').should('be.visible');
      });
    });
  });

  describe('with default dashboard', () => {
    const defaultDashboard: DashboardTemplate = {
      ...mockDashboard,
      default: true,
    };

    it('has Set as homepage item disabled when dashboard is default', () => {
      cy.mount(
        <MemoryRouter>
          <GenericHeader dashboard={defaultDashboard} onRenameDashboard={cy.stub()} />
        </MemoryRouter>
      );

      cy.get('button[aria-label="kebab dropdown toggle"]').click();
      cy.contains('[role="menuitem"]', 'Set as homepage').should('have.attr', 'aria-disabled', 'true');
    });
  });
});
