import { test, expect } from "@playwright/test";

// 상수 정의
const PRODUCTS = {
  AMERICA: 'America',
  ENGLAND: 'England'
};

const OPTIONS = {
  INSURANCE: 'Insurance'
};

test("전체 주문 프로세스 E2E 테스트", async ({ page }) => {
  // 1. 초기 페이지 로드
  await page.goto("/");
  await expect(page).toHaveTitle(/여행 상품점/);

  // 2. 상품 선택 페이지
  // America 상품 선택
  const americaInput = page.getByRole("spinbutton", { name: PRODUCTS.AMERICA });
  await americaInput.fill("2");
  await expect(page.getByText(/총 상품 가격: /)).not.toContainText("NaN");

  // England 상품 선택
  const englandInput = page.getByRole("spinbutton", { name: PRODUCTS.ENGLAND });
  await englandInput.fill("3");
  await expect(page.getByText(/총 상품 가격: /)).not.toContainText("NaN");

  // 보험 옵션 선택
  await page.getByRole("checkbox", { name: OPTIONS.INSURANCE }).check();

  // 주문하기 버튼 클릭
  await page.getByRole("button", { name: "주문하기" }).click();

  // 3. 주문 확인 페이지
  // 페이지 타이틀 확인
  await expect(page.getByRole("heading", { name: "주문 확인" })).toBeVisible();

  // 총 주문 금액 확인
  await expect(page.getByRole("heading", { name: /총 주문 금액: 5,500원/ })).toBeVisible();

  // 포인트 확인
  await expect(page.getByRole("heading", { name: /현재 보유 포인트: 5,000원/ })).toBeVisible();

  // 선택한 상품 확인
  const selectedItems = page.getByTestId("selected-items");
  await expect(selectedItems).toContainText("2 America");
  await expect(selectedItems).toContainText("3 England");
  await expect(selectedItems).toContainText("Insurance");

  // 주문 확인 체크박스 선택
  await page.getByRole("checkbox", { name: "주문을 확인하셨나요?" }).check();

  // 결제하기 버튼 클릭
  await page.getByRole("button", { name: "결제하기" }).click();

  // 4. 주문 완료 페이지
  // 주문 완료 메시지 확인 (타임아웃 증가)
  await expect(page.getByRole("heading", { name: "주문이 성공했습니다!" }), {
    timeout: 10000 // 10초로 타임아웃 증가
  }).toBeVisible();

  // 5. 첫 페이지로 돌아가기
  await page.getByRole("button", { name: "첫페이지로" }).click();

  // 6. 초기 상태 확인
  await expect(page.getByText(/총 상품 가격: 0원/)).toBeVisible();
  await expect(page.getByText(/총 옵션 가격: 0원/)).toBeVisible();
  await expect(page.getByRole("spinbutton", { name: PRODUCTS.AMERICA })).toBeVisible();
}); 