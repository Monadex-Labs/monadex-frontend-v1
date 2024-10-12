/**********************************************
***how to run E2E tests****
- @pnpm install
- @pnpm dev
- @npm run cy:open
- @go to your cypress inteface opened in our localhost
- @run the tests on te interface
*********************************************** */
describe('Swap Integration', () => {
  beforeEach(() => {
    cy.visit('/')
  })
  it('can enter an amount into input', () => {
    // Wait for the swap interface to be visible
    cy.get('#swap-currency-input', { timeout: 10000 }).should('be.visible')
    cy.get('#swap-currency-input').children()
    //
    cy.get('#swap-currency-input')
      .type('0.001', { delay: 200 })
      .should('have.value', '0.001')
  })

  //   it('zero swap amount', () => {
  //     cy.get('#swap-currency-input')
  //       .type('0.0', { delay: 200 })
  //       .should('have.value', '0.0')
  //   })
  //   it('invalid swap amount', () => {
  //     cy.get('#swap-currency-input ')
  //       .type('ds', { delay: 200 })
  //       .should('have.value', '')
  //   })
  //   it('can enter an amount into output', () => {
  //     cy.get('#swap-currency-output')
  //       .type('0.001', { delay: 200 })
  //       .should('have.value', '0.001')
  //   })
  //   it('zero output amount', () => {
  //     cy.get('#swap-currency-output ')
  //       .type('0.0', { delay: 200 })
  //       .should('have.value', '0.0')
  //   })

//   it('can swap MDX for PEPE', () => {
//     // select INPUT CURRENCY MDX
//     cy.get('#swap-currency-input').click()
//     cy.get('#token-item-0xD24291BF0037f0ae0482f6757b5dFf437419bF25').should(
//       'be.visible'
//     )
//     cy.get('#token-item-0xD24291BF0037f0ae0482f6757b5dFf437419bF25').click({
//       force: true
//     })
//     cy.get('#swap-currency-input [data-cy="token-amount-input"]').should('be.visible')
//     cy.get('#swap-currency-input [data-cy="token-amount-input"]').type('0.001', {
//       force: true,
//       delay: 200
//     })
//     // SELECT OUTPUT CURRENCY PEPE
//     cy.get('#swap-currency-output').click()
//     cy.get('#token-item-0x49D75Bb3ef83Bdd83bef36aEA14F9421e6b05603').should(
//       'be.visible'
//     )
//     cy.get('#token-item-0x49D75Bb3ef83Bdd83bef36aEA14F9421e6b05603').click({
//       force: true
//     })
//     cy.get('#swap-currency-output [data-cy="token-amount-input"]').should('not.equal', '')
//     cy.get('#swap-button').click()
//     cy.get('#confirm-swap-or-send').should('contain', 'Confirm Transaction')
//   })
})
