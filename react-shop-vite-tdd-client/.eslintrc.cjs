module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    "cypress/globals": true, // Cypress 환경 추가
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
    "plugin:testing-library/react",
    "plugin:vitest/recommended",
  ],
  // ... 나머지 설정
  plugins: ["react-refresh", "cypress"], // Cypress 플러그인 추가
  // ...
};