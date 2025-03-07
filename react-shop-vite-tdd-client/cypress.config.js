import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    experimentalStudio: true, // 자동 테스트 코드 생성 설정
    baseUrl: "http://localhost:3000/", // ✅ 기본 URL 설정,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
