import { test, expect } from "@playwright/test";

test("홈페이지 제목 확인", async ({ page }) => {
  await page.goto("/"); // baseURL 설정을 사용하여 이동
  await expect(page).toHaveTitle(/여행 상품점/); // 페이지 제목 검증
});
