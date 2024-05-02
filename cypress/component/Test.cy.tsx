import React from 'react';

// check that a placeholder component mounts without crashing
const Test = () => {
    return <div>Test</div>;
};

// mount the component cypress test
describe('Test', () => {
    it('should mount', () => {
        cy.mount(<Test />);
    });
});