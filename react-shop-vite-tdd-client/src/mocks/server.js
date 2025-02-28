import { setupServer } from 'msw/node'; // Node.js에서 동작하도록 MSW server 사용
import { handlers } from './handlers'; // API 요청 핸들러 목록 가져오기

export const server = setupServer(...handlers);
