describe('Portal login flow', () => {
  it('displays the portal shell and iframe call-to-action', () => {
    cy.visit('/');
    cy.contains('Portal Dashboard').should('be.visible');
    cy.contains('Launch the partner session').should('exist');
  });
});
