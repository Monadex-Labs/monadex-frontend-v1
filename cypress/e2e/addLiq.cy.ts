describe('Swap Integration', () => {
  beforeEach(() => {
    cy.visit('/pools/new?currency0=0x49D75Bb3ef83Bdd83bef36aEA14F9421e6b05603&currency1=0xD24291BF0037f0ae0482f6757b5dFf437419bF25')
  })
  it('expect to find the two selected tokens', () => {
    cy.get('#add-liquidity-input-tokena .w-full .relative .outline-none .border-none').should(
      'contain.text',
      'PEPE'
    )
    cy.get('#add-liquidity-input-tokenb .w-full .relative .outline-none .border-none').should(
      'contain.text',
      'MDX'
    )
  })
})
