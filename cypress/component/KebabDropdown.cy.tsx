import React from 'react';
import { KebabDropdown } from '../../src/Components/Header/Header';
import { MemoryRouter } from 'react-router-dom';

describe('KebabDropdown', () => {
  beforeEach(() => {
    cy.mount(
      <MemoryRouter>
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px' }}>
          <KebabDropdown />
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

    cy.get('[role="menuitem"]').should('have.length', 4);
    cy.contains('[role="menuitem"]', 'Copy configuration string').should('be.visible');
    cy.contains('[role="menuitem"]', 'Duplicate dashboard').should('be.visible');
    cy.contains('[role="menuitem"]', 'Share dashboard').should('be.visible');
    cy.contains('[role="menuitem"]', 'Dashboard Hub').should('be.visible');
  });

  it('has Dashboard Hub item enabled with correct link', () => {
    cy.get('button[aria-label="kebab dropdown toggle"]').click();

    cy.contains('[role="menuitem"]', 'Dashboard Hub')
      .should('not.be.disabled')
      .should('have.attr', 'href', '/staging/dashboard-hub');
  });

  it('toggle button has expanded state when open', () => {
    cy.get('button[aria-label="kebab dropdown toggle"]').should('have.attr', 'aria-expanded', 'false');
    cy.get('button[aria-label="kebab dropdown toggle"]').click();
    cy.get('button[aria-label="kebab dropdown toggle"]').should('have.attr', 'aria-expanded', 'true');
  });
});
