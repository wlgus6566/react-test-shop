import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    // this points to the setup file
    setupFiles: "./src/setupTests.js",
    exclude: ['playwright-test/**', 'tests-examples/**'],
    // you might want to disable it, if you don't have tests that rely on CSS
    // since parsing CSS is slow
    css: true
  },
  server: {
    host: 'localhost',
    port: 3000, // 또는 다른 포트
  },

});
