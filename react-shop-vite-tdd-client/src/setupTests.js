// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// src/setupTests.js
import { server } from "./mocks/server";
// 모든 테스트가 시작하기 전에 server를 listen
beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests,
// 모든 request handler들을 리셋해줘서 다른 handler에 영향이 가지 않게
afterEach(() => server.resetHandlers());

// 테스트가 끝났을 때 서버를 cleanup
afterAll(() => server.close());
