describe("로컬 프로젝트 테스트", () => {
  it("홈페이지 방문", () => {
    cy.visit("/"); // ✅ 기본 URL이 `http://localhost:3000`으로 자동 설정됨
  });

  /* ==== Test Created with Cypress Studio ==== */
  it('order process', function() {
    /* ==== Generated with Cypress Studio ==== */
    cy.visit('/');
    /* ==== Generated with Cypress Studio ==== */
    cy.get('.p-4').click();
    cy.get('#America').clear();
    cy.get('#America').type('2');
    cy.get('#England').clear('4');
    cy.get('#England').type('4');
    cy.get('#FirstClass-option').check();
    cy.get('.btn').click();
    cy.get('#usePointsCheckbox').check();
    cy.get('#usedPointsInput').clear('3');
    cy.get('#usedPointsInput').type('3000');
    cy.get('#confirmCheckbox').check();
    cy.get('.submit-button').click();
    cy.get('.btn-primary').click();
    /* ==== End Cypress Studio ==== */
  });
});