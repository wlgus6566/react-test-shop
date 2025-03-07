describe("로컬 프로젝트 테스트", () => {
  it("홈페이지 방문", () => {
    cy.visit("/"); // ✅ 기본 URL이 `http://localhost:3000`으로 자동 설정됨
  });

  /* ==== Test Created with Cypress Studio ==== */


  it("주문 프로세스", function() {
    /* ==== Generated with Cypress Studio ==== */
    cy.visit('/');
    /* ==== End Cypress Studio ==== */
    /* ==== Generated with Cypress Studio ==== */
    cy.get('#America').click();
    cy.get('#America').click();
    cy.get('#England').click();
    cy.get('#Portland').click();
    cy.get('#Insurance-option').check();
    cy.get('#FirstClass-option').check();
    cy.get('.btn').click();
    cy.get('#usePointsCheckbox').check();
    cy.get('#usedPointsInput').clear('0');
    cy.get('#usedPointsInput').type('5000');
    cy.get('#confirmCheckbox').check();
    cy.get('.submit-button').click();
    cy.get('.btn-primary').click();
    /* ==== End Cypress Studio ==== */
  });
});