# Playwright 테스트 작성 가이드

## 1. 프로젝트 구조
```
react-shop-vite-tdd-client/
├── playwright-test/            
│   ├── e2e/             # Playwright E2E 테스트
```

## 2. 테스트 파일 작성 규칙
### 파일 명명 규칙
- 테스트 파일은 .spec.ts 확장자 사용
- 파일명은 하이픈(-)으로 구분하고 테스트 대상을 명확히 표현
```
login.spec.ts
create-post.spec.ts
user-profile.spec.ts
```

### 기본 테스트 구조
```ts
import { test, expect } from '@playwright/test';
import { TEST_USERS } from '../fixtures/users';

test.describe('인증 및 로그인 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('유효한 자격증명으로 로그인 시 대시보드로 이동', async ({ page }) => {
    // 테스트 로직
  });
});
```

## 3. 테스트 케이스 작성 규칙
### 테스트 설명
```ts
// ❌ 잘못된 예
test('login test', async ({ page }) => {});

// ✅ 좋은 예
test('유효한 이메일과 비밀번호로 로그인 시 대시보드로 이동해야 함', async ({ page }) => {});
```

### 테스트 단계 구분
```ts
test('상품 구매 프로세스', async ({ page }) => {
  await test.step('상품 페이지 진입', async () => {
    await page.goto('/products/1');
    await expect(page).toHaveURL('/products/1');
  });

  await test.step('장바구니에 추가', async () => {
    await page.getByRole('button', { name: '장바구니 추가' }).click();
    await expect(page.getByRole('alert')).toHaveText('장바구니에 추가되었습니다');
  });
});
```

## 4. Locator 전략
### 우선순위
```ts
// 1. Role과 접근성 속성 (최우선)
page.getByRole('button', { name: '로그인' })
page.getByLabel('이메일')
page.getByRole('textbox', { name: '비밀번호' })
page.getByRole('heading', { name: '회원가입' })

// 2. 텍스트 및 기타
page.getByText('계정 만들기')
page.getByPlaceholder('이메일을 입력하세요')

// 3. 테스트 ID (Role과 접근성 속성으로 선택이 어려운 경우에 사용)
// ⚠️ 사용 전 반드시 해당 요소에 data-testid 속성이 정의되어 있는지 확인
page.getByTestId('submit-button')

// 안티 패턴
// ❌ 피해야 할 방식
page.locator('.login-btn')
page.locator('div > button')
```

## 5. 검증(Assertions) 가이드
```ts
// 요소 상태 검증
await expect(page.getByRole('button')).toBeEnabled();
await expect(page.getByRole('alert')).toBeVisible();

// 텍스트 검증
await expect(page.getByRole('heading')).toHaveText('환영합니다');

// URL 검증
await expect(page).toHaveURL(/.*dashboard/);

// 다중 요소 검증
await expect(page.getByRole('listitem')).toHaveCount(3);
```

## 6. 테스트 데이터 관리
```ts
// tests/fixtures/users.ts
export const TEST_USERS = {
  valid: {
    email: 'test@example.com',
    password: 'password123'
  },
  invalid: {
    email: 'invalid@example.com',
    password: 'wrong'
  }
};
```

## 7. 모킹 전략
다음과 같은 경우에만 API 모킹을 사용합니다:
- 외부 API 의존성이 있는 경우
- 테스트 환경에서 실제 API가 사용 불가능한 경우
- 특정 에러 상황 테스트가 필요한 경우
```ts
// 특정 에러 상황 테스트를 위한 모킹 예시
test('API 에러 발생 시 에러 메시지 표시', async ({ page }) => {
  await page.route('**/api/users', route => {
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: '서버 오류가 발생했습니다.' })
    });
  });

  await page.goto('/users');
  await expect(page.getByRole('alert')).toHaveText('서버 오류가 발생했습니다.');
});
```
```