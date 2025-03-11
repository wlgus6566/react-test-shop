# Playwright 테스트 작성 가이드

## 1. 프로젝트 구조
```
react-shop-vite-tdd-client/
├── playwright/           # Playwright 소스 폴더
│   ├── e2e/              # Playwright E2E 테스트 폴더 
│   ├── fixtures/         # Playwright E2E 테스트 데이터 
│   ├── example/          # Playwright E2E 테스트 예시 소스 폴더
│   │   ├── demo.spec.js  # Playwright E2E 테스트 예시 파일
```
Playwright e2e 테스트파일들은 모두 react-shop-vite-tdd-client/playwright/e2e 폴더에 위치시킵니다.


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
// ✅ 정확한 텍스트 매칭
page.getByText('계정 만들기')
page.getByPlaceholder('이메일을 입력하세요')

// ✅ 정규식을 사용한 유연한 텍스트 매칭
page.getByText(/포인트:?\s*\d{1,3}(,\d{3})*원?/)
page.getByText(/총\s*금액:\s*\d+/)

// ✅ 부분 텍스트 매칭
page.getByText('포인트', { exact: false })
page.getByText('원', { exact: false })

// 3. 테스트 ID (Role과 접근성 속성으로 선택이 어려운 경우에 사용)
// ⚠️ 사용 전 반드시 해당 요소에 data-testid 속성이 정의되어 있는지 확인
page.getByTestId('submit-button')

// 안티 패턴
// ❌ 피해야 할 방식
page.locator('.login-btn')
page.locator('div > button')
```

### 유연한 텍스트 매칭 전략
1. **정규식 사용**
   ```ts
   // 숫자 형식이 다양한 경우
   page.getByText(/\d{1,3}(,\d{3})*/) // 1,234,567 또는 123,456
   
   // 접미사가 선택적인 경우
   page.getByText(/포인트:?\s*\d+(원)?/)
   
   // 여러 형식을 허용하는 경우
   page.getByText(/총\s*(금액|가격):/)
   ```

2. **부분 텍스트 매칭**
   ```ts
   // exact: false 옵션 사용
   page.getByText('포인트', { exact: false }) // "사용 가능 포인트: 1,000원" 매칭
   ```

3. **동적 값 처리**
   ```ts
   // 변수를 포함한 정규식 패턴
   const points = 5000;
   const pattern = new RegExp(`${points.toLocaleString()}(원)?`);
   page.getByText(pattern)
   ```

## 5. 검증(Assertions) 가이드
```ts
// 요소 상태 검증
await expect(page.getByRole('button')).toBeEnabled();
await expect(page.getByRole('alert')).toBeVisible();

// 텍스트 검증
// ✅ 정확한 텍스트 매칭
await expect(page.getByRole('heading')).toHaveText('환영합니다');

// ✅ 정규식을 사용한 유연한 텍스트 매칭
await expect(page.getByText(/포인트/)).toBeVisible();
await expect(page.getByRole('heading')).toHaveText(/환영합니다.*/);

// ✅ 동적 값을 포함한 텍스트 검증
const expectedPoints = 5000;
const pointsPattern = new RegExp(`^(${expectedPoints}|${expectedPoints.toLocaleString()})(원|P)?$`);
await expect(page.getByText(pointsPattern)).toBeVisible();

// URL 검증
await expect(page).toHaveURL(/.*dashboard/);

// 다중 요소 검증
await expect(page.getByRole('listitem')).toHaveCount(3);
```

### 유연한 검증 전략
1. **숫자 형식 검증**
   ```ts
   // 천 단위 구분자와 단위가 있는 경우
   const price = 1000000;
   const pricePattern = new RegExp(`${price.toLocaleString()}(원|₩)?`);
   await expect(page.getByText(pricePattern)).toBeVisible();
   
  const pointsPattern = new RegExp(`^(${expectedPoints}|${expectedPoints.toLocaleString()})(원|P)?$`);
  const pointElements = await page.getByText(pointsPattern).all();
  expect(pointElements.length).toBeGreaterThan(0);


   // 범위로 검증
   const pointsPattern = new RegExp(`^(${expectedPoints}|${expectedPoints.toLocaleString()})(원|P)?$`);
   expect(pointElements.length).toBeGreaterThan(0);
   ```

2. **선택적 텍스트 검증**
   ```ts
   // 접두사/접미사가 선택적인 경우
   await expect(page.getByText(/잔여:?\s*\d+(원)?/)).toBeVisible();
   
   // 여러 형식 허용
   await expect(page.getByText(/(총액|합계):\s*\d+/)).toBeVisible();
   ```

3. **동적 컨텐츠 검증**
   ```ts
   // 부분 일치 검증
   await expect(page.getByText('주문')).toBeVisible();
   
   // 여러 가지 가능한 상태 검증
   await expect(page.getByText(/처리 중|완료됨/)).toBeVisible();
   
   // 날짜/시간 형식 검증
   await expect(page.getByText(/\d{4}-\d{2}-\d{2}/)).toBeVisible();
   ```

## 6. 테스트 데이터 관리
- 테스트데이터는 fixtures 폴더 아래에 위치
```ts
// tests/fixtures/users.ts
export const TEST_USERS = {
    valid: {
        username: 'wlgus6566',
        password: '1234',
        points: 5000
    },
    invalid: {
        username: 'wronguser',
        password: 'wrongpassword'
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
## 8. API 호출 전략
### 기본 원칙
1. 실제 API 호출과 모킹을 적절히 혼합하여 사용
2. 핵심 기능 테스트는 실제 API 호출 사용
3. 에러 케이스나 특수 상황은 모킹 활용

### localStorage 테스트 전략
```ts
// ❌ 피해야 할 방식: localStorage 직접 접근
test('로그인 후 상태 확인', async ({ page }) => {
    // localStorage 직접 접근은 보안 오류를 발생시킬 수 있음
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();
});

// ✅ 권장하는 방식: UI 요소를 통한 상태 확인
test('로그인 후 상태 확인', async ({ page }) => {
    // UI에 표시되는 사용자 정보로 상태 확인
    await expect(page.getByText('사용자명')).toBeVisible();
    await expect(page.getByText('5,000')).toBeVisible();
});

// ✅ 권장하는 방식: context 레벨에서 초기화
test.beforeEach(async ({ page, context }) => {
    // context 레벨에서 권한 초기화
    await context.clearPermissions();
    await page.goto('/login');
});
```

### localStorage 테스트 시 주의사항
1. **직접 접근 지양**
   - localStorage 직접 접근은 보안 오류 발생 가능
   - 브라우저 정책에 따라 테스트 실패 가능성 있음

2. **UI 기반 검증 활용**
   - localStorage 대신 실제 UI 요소로 상태 확인
   - 사용자 관점에서의 테스트 가능
   - 더 안정적이고 신뢰성 있는 테스트 작성 가능

3. **테스트 격리**
   - context.clearPermissions() 사용
   - 각 테스트 케이스의 독립성 보장
   - 테스트 간 상태 간섭 방지

4. **실제 사용자 시나리오 반영**
   ```ts
   test('로그인 후 사용자 정보 표시', async ({ page }) => {
       // 1. 로그인 수행
       await page.getByLabel('아이디').fill(TEST_USERS.valid.username);
       await page.getByLabel('비밀번호').fill(TEST_USERS.valid.password);
       await page.getByRole('button', { name: '로그인' }).click();

       // 2. API 응답 대기
       await page.waitForResponse(res => 
           res.url().includes('/login') && res.status() === 200
       );

       // 3. UI를 통한 상태 확인
       await expect(page).toHaveURL('/');
       await expect(page.getByText(TEST_USERS.valid.username)).toBeVisible();
       await expect(page.getByText(TEST_USERS.valid.points.toLocaleString())).toBeVisible();
   });

   await test.step('주문 완료 확인', async () => {
      // 주문 성공 메시지 확인
      await expect(page.getByText('주문이 성공했습니다!')).toBeVisible();

      // 남은 포인트 확인 (5000 - 2000 = 3000)
      await expect(page.getByText('남은 포인트: 3,000원')).toBeVisible();

      // 주문 내역의 최종 결제 금액 확인
      const orderTable = page.getByRole('table');
      await expect(orderTable).toBeVisible();
      
      // 가장 최근 주문의 금액이 5,000원인지 확인
      const lastOrderPrice = await page.locator('table tbody tr:last-child td:last-child').textContent();
      expect(lastOrderPrice).toBe('5000');
        });
   ```
