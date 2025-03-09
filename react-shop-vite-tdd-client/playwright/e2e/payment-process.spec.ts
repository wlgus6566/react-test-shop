import { test, expect } from '@playwright/test';

// 테스트 데이터
const TEST_USER = {
    username: 'testuser',
    password: 'testpass123',
    points: 10000
};

const PRODUCTS = [
    {
        name: 'America',
        imagePath: '/images/america.jpeg',
        description: 'Good America',
        price: 1000
    },
    {
        name: 'England',
        imagePath: '/images/england.jpeg',
        description: 'Good England',
        price: 2000
    }
];

const OPTIONS = [
    {
        name: 'Insurance',
        description: '안전한 여행을 위해서!',
        price: 500
    },
    {
        name: 'Dinner',
        description: '맛있는 저녁과 함께하는 여행!',
        price: 500
    }
];

const ORDER_RESPONSE = {
    orderNumber: 12345,
    price: 4000  // America(1000 x 2) + England(2000 x 1)
};

test.describe('여행상품 결제 프로세스', () => {
    test.beforeEach(async ({ page }) => {
        // API 응답 모킹
        await page.route('http://localhost:5003/login', async route => {
            const requestBody = JSON.parse(route.request().postData() || '{}');
            if (requestBody.username === TEST_USER.username && 
                requestBody.password === TEST_USER.password) {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        token: 'mock-token',
                        user: { ...TEST_USER }
                    })
                });
            } else {
                await route.fulfill({
                    status: 401,
                    contentType: 'application/json',
                    body: JSON.stringify({ message: '로그인에 실패했습니다.' })
                });
            }
        });

        await page.route('http://localhost:5003/products', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(PRODUCTS)
            });
        });

        await page.route('http://localhost:5003/options', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(OPTIONS)
            });
        });

        await page.route('http://localhost:5003/order', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(ORDER_RESPONSE)
            });
        });

        await page.route('http://localhost:5003/order-history', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([ORDER_RESPONSE])
            });
        });

        // 로그인 페이지로 이동
        await page.goto('/login');
    });

    test('전체 결제 프로세스 테스트', async ({ page }) => {
        // 1. 로그인
        await test.step('로그인', async () => {
            await page.locator('#username').fill(TEST_USER.username);
            await page.locator('#password').fill(TEST_USER.password);
            await page.getByRole('button', { name: '로그인' }).click();
            
            // 메인 페이지로 이동 확인
            await expect(page).toHaveURL('/');
        });

        // 2. 상품 선택
        await test.step('상품 선택', async () => {
            // America 2개 선택
            await page.getByRole('spinbutton', { name: 'America' }).fill('2');

            // England 1개 선택
            await page.getByRole('spinbutton', { name: 'England' }).fill('1');

            // 상품 총액 확인 (America 2개: 2000원 + England 1개: 2000원 = 4000원)
            const productsTotal = await page.getByText('총 상품 가격:', { exact: false });
            await expect(productsTotal).toHaveText('총 상품 가격: 4,000원');
        });

        // 3. 옵션 선택
        await test.step('옵션 선택', async () => {
            // Insurance 선택
            await page.getByRole('checkbox', { name: 'Insurance' }).check();

            // Dinner 선택
            await page.getByRole('checkbox', { name: 'Dinner' }).check();

            // 옵션 총액 확인 (Insurance: 500원 + Dinner: 500원 = 1000원)
            const optionsTotal = await page.getByText('총 옵션 가격:', { exact: false });
            await expect(optionsTotal).toHaveText('총 옵션 가격: 1,000원');
        });

        // 4. 주문 진행
        await test.step('주문 진행', async () => {
            // 주문하기 버튼 클릭
            await page.getByRole('button', { name: '주문하기' }).click();

            // 포인트 사용
            await page.getByRole('checkbox', { name: '포인트 사용하기' }).check();
            await page.getByLabel('사용할 포인트:').fill('2000');

            // 주문 확인
            await page.getByRole('checkbox', { name: '주문을 확인하셨나요?' }).check();

            // 결제하기 버튼 클릭
            await page.getByRole('button', { name: '결제하기' }).click();
        });

        // 5. 주문 완료 확인
        await test.step('주문 완료 확인', async () => {
            // 성공 메시지 확인
            await expect(page.getByText('주문이 성공했습니다!')).toBeVisible();

            // 주문 내역 확인
            await expect(page.getByRole('cell', { name: ORDER_RESPONSE.orderNumber.toString() })).toBeVisible();
            await expect(page.getByRole('cell', { name: ORDER_RESPONSE.price.toLocaleString() + '원' })).toBeVisible();

            // 남은 포인트 확인 (10000 - 2000 = 8000)
            await expect(page.getByText('남은 포인트: 8,000원')).toBeVisible();
        });
    });
}); 