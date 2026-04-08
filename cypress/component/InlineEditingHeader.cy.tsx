import React from 'react';
import InlineEditableName from '../../src/Components/InlineEditableName/InlineEditableName';

describe('InlineEditableName', () => {
  it('displays the name as an h2 heading', () => {
    cy.mount(<InlineEditableName name="My Dashboard" />);
    cy.contains('h2', 'My Dashboard').should('be.visible');
  });

  it('shows pencil edit button when onNameChange is provided', () => {
    cy.mount(<InlineEditableName name="My Dashboard" onNameChange={cy.stub()} />);
    cy.get('button[aria-label="Edit dashboard name"]').should('be.visible');
  });

  it('does not show pencil edit button when onNameChange is not provided', () => {
    cy.mount(<InlineEditableName name="My Dashboard" />);
    cy.get('button[aria-label="Edit dashboard name"]').should('not.exist');
  });

  it('enters edit mode with pre-filled input on pencil click', () => {
    cy.mount(<InlineEditableName name="My Dashboard" onNameChange={cy.stub()} />);
    cy.get('button[aria-label="Edit dashboard name"]').click();

    cy.get('input[aria-label="Dashboard name"]')
      .should('be.visible')
      .and('have.value', 'My Dashboard');
    cy.get('button[aria-label="Confirm name"]').should('be.visible');
    cy.get('button[aria-label="Cancel editing"]').should('be.visible');
  });

  it('calls onNameChange with new trimmed name on confirm click', () => {
    const onNameChange = cy.stub().as('onNameChange').resolves();
    cy.mount(<InlineEditableName name="My Dashboard" onNameChange={onNameChange} />);

    cy.get('button[aria-label="Edit dashboard name"]').click();
    cy.get('input[aria-label="Dashboard name"]').clear().type('  Renamed Dashboard  ');
    cy.get('button[aria-label="Confirm name"]').click();

    cy.get('@onNameChange').should('have.been.calledOnceWith', 'Renamed Dashboard');
  });

  it('exits edit mode after confirming', () => {
    const onNameChange = cy.stub().resolves();
    cy.mount(<InlineEditableName name="My Dashboard" onNameChange={onNameChange} />);

    cy.get('button[aria-label="Edit dashboard name"]').click();
    cy.get('input[aria-label="Dashboard name"]').clear().type('Updated');
    cy.get('button[aria-label="Confirm name"]').click();

    cy.get('input[aria-label="Dashboard name"]').should('not.exist');
    cy.get('button[aria-label="Edit dashboard name"]').should('be.visible');
  });

  it('reverts name and exits edit mode on cancel click', () => {
    const onNameChange = cy.stub().as('onNameChange');
    cy.mount(<InlineEditableName name="My Dashboard" onNameChange={onNameChange} />);

    cy.get('button[aria-label="Edit dashboard name"]').click();
    cy.get('input[aria-label="Dashboard name"]').clear().type('Something else');
    cy.get('button[aria-label="Cancel editing"]').click();

    cy.contains('h2', 'My Dashboard').should('be.visible');
    cy.get('input[aria-label="Dashboard name"]').should('not.exist');
    cy.get('@onNameChange').should('not.have.been.called');
  });

  it('confirms edit on Enter key', () => {
    const onNameChange = cy.stub().as('onNameChange').resolves();
    cy.mount(<InlineEditableName name="My Dashboard" onNameChange={onNameChange} />);

    cy.get('button[aria-label="Edit dashboard name"]').click();
    cy.get('input[aria-label="Dashboard name"]').clear().type('Enter Dashboard{enter}');

    cy.get('@onNameChange').should('have.been.calledOnceWith', 'Enter Dashboard');
    cy.get('input[aria-label="Dashboard name"]').should('not.exist');
  });

  it('cancels edit on Escape key', () => {
    const onNameChange = cy.stub().as('onNameChange');
    cy.mount(<InlineEditableName name="My Dashboard" onNameChange={onNameChange} />);

    cy.get('button[aria-label="Edit dashboard name"]').click();
    cy.get('input[aria-label="Dashboard name"]').clear().type('Discarded{esc}');

    cy.get('@onNameChange').should('not.have.been.called');
    cy.contains('h2', 'My Dashboard').should('be.visible');
  });

  it('does not call onNameChange when name is empty', () => {
    const onNameChange = cy.stub().as('onNameChange');
    cy.mount(<InlineEditableName name="My Dashboard" onNameChange={onNameChange} />);

    cy.get('button[aria-label="Edit dashboard name"]').click();
    cy.get('input[aria-label="Dashboard name"]').clear();
    cy.get('button[aria-label="Confirm name"]').click();

    cy.get('@onNameChange').should('not.have.been.called');
  });

  it('does not call onNameChange when name is only whitespace', () => {
    const onNameChange = cy.stub().as('onNameChange');
    cy.mount(<InlineEditableName name="My Dashboard" onNameChange={onNameChange} />);

    cy.get('button[aria-label="Edit dashboard name"]').click();
    cy.get('input[aria-label="Dashboard name"]').clear().type('   ');
    cy.get('button[aria-label="Confirm name"]').click();

    cy.get('@onNameChange').should('not.have.been.called');
  });

});