import React from 'react';
import { ImportModal } from '../../src/Components/DashboardHub/ImportModal/ImportModal';

describe('ImportModal', () => {
  it('renders modal with title "Import configuration string" when isOpen=true', () => {
    const onClose = cy.stub();
    cy.mount(<ImportModal isOpen={true} onClose={onClose} />);
    cy.contains('Import configuration string').should('be.visible');
  });

  it('does not render modal content when isOpen=false', () => {
    const onClose = cy.stub();
    cy.mount(<ImportModal isOpen={false} onClose={onClose} />);
    cy.contains('Import configuration string').should('not.exist');
  });

  it('shows "Create dashboard" button which is disabled when form is empty', () => {
    const onClose = cy.stub();
    cy.mount(<ImportModal isOpen={true} onClose={onClose} />);
    cy.contains('button', 'Create dashboard').should('be.visible').and('be.disabled');
  });

  it('Cancel button calls onClose', () => {
    const onClose = cy.stub().as('onClose');
    cy.mount(<ImportModal isOpen={true} onClose={onClose} />);
    cy.contains('button', 'Cancel').click();
    cy.get('@onClose').should('have.been.calledOnce');
  });

  it('dashboard name text input is present and can be typed into', () => {
    const onClose = cy.stub();
    cy.mount(<ImportModal isOpen={true} onClose={onClose} />);
    cy.get('#dashboard-name')
      .should('be.visible')
      .clear()
      .type('My New Dashboard')
      .should('have.value', 'My New Dashboard');
  });

  it('form labels are correct', () => {
    const onClose = cy.stub();
    cy.mount(<ImportModal isOpen={true} onClose={onClose} />);
    cy.contains('label', 'Paste configuration string').should('be.visible');
    cy.contains('label', 'New dashboard name').should('be.visible');
  });
});
