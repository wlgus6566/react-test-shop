// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
// 테스트를 실행할 때마다 API Mocking 서버를 초기화하고, 모든 테스트가 끝나면 서버를 정리하는 기능
import "@testing-library/jest-dom";
import 'whatwg-fetch';

// src/setupTests.js
import { server } from "./mocks/server";

// 모든 테스트가 시작하기 전에 서버 시작
beforeAll(() => server.listen());

// 각 테스트 후 핸들러 상태 초기화
afterEach(() => server.resetHandlers());

// 모든 테스트가 끝난 후 서버 종료
afterAll(() => server.close());
