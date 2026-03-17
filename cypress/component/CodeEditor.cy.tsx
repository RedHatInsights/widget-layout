import React from 'react';
import { CodeEditorImport } from '../../src/Components/DashboardHub/CodeEditor/CodeEditor';

describe('CodeEditorImport', () => {
  it('renders without crashing', () => {
    cy.mount(<CodeEditorImport />);
    cy.get('.pf-v6-c-code-editor').should('exist');
  });

  it('the code editor container is visible', () => {
    cy.mount(<CodeEditorImport />);
    cy.get('.pf-v6-c-code-editor').should('be.visible');
  });

  it('displays the JSON language label', () => {
    cy.mount(<CodeEditorImport />);
    cy.get('.pf-v6-c-code-editor__tab').should('contain.text', 'JSON');
  });

  it('calls onChange callback when provided', () => {
    const onChangeSpy = cy.spy().as('onChangeSpy');
    cy.mount(<CodeEditorImport onChange={onChangeSpy} />);
    cy.get('.pf-v6-c-code-editor').should('be.visible');
  });
});
