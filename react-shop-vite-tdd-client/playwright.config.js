import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./playwright-tests", // 테스트 폴더 지정
  timeout: 30 * 1000, // 각 테스트 실행 시간 제한
  use: {
    baseURL: "http://localhost:3000", // 로컬 서버 주소 설정
    headless: true, // 브라우저 없이 실행
    screenshot: "only-on-failure", // 실패 시 스크린샷 저장
    video: "retain-on-failure", // 실패 시 비디오 저장
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "firefox", use: { browserName: "firefox" } },
    { name: "webkit", use: { browserName: "webkit" } },
  ],
});
