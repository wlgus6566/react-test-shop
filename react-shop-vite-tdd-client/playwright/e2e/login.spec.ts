import { test, expect } from '@playwright/test';
import { TEST_USERS } from '../fixtures/users';

test.describe('로그인 페이지 테스트', () => {
    test.beforeEach(async ({ page }) => {
        // 각 테스트 전에 로그인 페이지로 이동
        await page.goto('/login');
    });

    test('유효한 자격증명으로 로그인 시 메인 페이지로 이동', async ({ page }) => {
        await test.step('로그인 폼 작성', async () => {
            await page.getByLabel('아이디').fill(TEST_USERS.valid.username);
            await page.getByLabel('비밀번호').fill(TEST_USERS.valid.password);
        });

        await test.step('로그인 버튼 클릭', async () => {
            await page.getByRole('button', { name: '로그인' }).click();
        });

        await test.step('메인 페이지 이동 확인', async () => {
            await expect(page).toHaveURL('/');
            await expect(page.getByText('여행 상품 주문')).toBeVisible();
        });

        await test.step('포인트 표시 확인', async () => {
            const pointsPattern = new RegExp(`${TEST_USERS.valid.points.toLocaleString()}(원|P)?`);
            await expect(page.getByText(pointsPattern)).toBeVisible();
        });
    });

    test('잘못된 자격증명으로 로그인 시 에러 메시지 표시', async ({ page }) => {
        await test.step('잘못된 자격증명 입력', async () => {
            await page.getByLabel('아이디').fill('wronguser');
            await page.getByLabel('비밀번호').fill('wrongpass');
        });

        await test.step('로그인 시도', async () => {
            await page.getByRole('button', { name: '로그인' }).click();
        });

        await test.step('에러 메시지 확인', async () => {
            await expect(page.getByRole('alert')).toBeVisible();
            await expect(page.getByRole('alert')).toContainText('사용자를 찾을 수 없습니다');
        });
    });

    test('빈 필드 제출 시 유효성 검사 메시지 표시', async ({ page }) => {
        await test.step('빈 폼 제출', async () => {
            await page.getByRole('button', { name: '로그인' }).click();
        });

        await test.step('유효성 검사 메시지 확인', async () => {
            await expect(page.getByTestId('username-error')).toHaveText('아이디를 입력해주세요.');
            await expect(page.getByTestId('password-error')).toHaveText('비밀번호를 입력해주세요.');
        });
    });

    test('로그인 상태에서 로그인 페이지 접근 시 메인 페이지로 리다이렉션', async ({ page }) => {
        await test.step('먼저 로그인', async () => {
            await page.getByLabel('아이디').fill(TEST_USERS.valid.username);
            await page.getByLabel('비밀번호').fill(TEST_USERS.valid.password);
            await page.getByRole('button', { name: '로그인' }).click();
            await expect(page).toHaveURL('/');
        });

        await test.step('로그인 페이지 접근 시도', async () => {
            await page.goto('/login');
            await expect(page).toHaveURL('/');
        });
    });

    test('회원가입 링크 이동 확인', async ({ page }) => {
        await test.step('회원가입 링크 클릭', async () => {
            await page.getByRole('link', { name: '회원가입' }).click();
        });

        await test.step('회원가입 페이지 이동 확인', async () => {
            await expect(page).toHaveURL('/register');
            await expect(page.getByRole('heading', { name: '회원가입' })).toBeVisible();
        });
    });

    test('아이디만 입력하고 로그인 시도 시 비밀번호 에러 메시지 표시', async ({ page }) => {
        await test.step('아이디만 입력', async () => {
            await page.getByLabel('아이디').fill(TEST_USERS.valid.username);
        });

        await test.step('로그인 시도', async () => {
            await page.getByRole('button', { name: '로그인' }).click();
        });

        await test.step('비밀번호 에러 메시지 확인', async () => {
            await expect(page.getByTestId('password-error')).toHaveText('비밀번호를 입력해주세요.');
            // 아이디 에러 메시지는 표시되지 않아야 함
            await expect(page.getByTestId('username-error')).not.toBeVisible();
        });
    });

    test('비밀번호만 입력하고 로그인 시도 시 아이디 에러 메시지 표시', async ({ page }) => {
        await test.step('비밀번호만 입력', async () => {
            await page.getByLabel('비밀번호').fill(TEST_USERS.valid.password);
        });

        await test.step('로그인 시도', async () => {
            await page.getByRole('button', { name: '로그인' }).click();
        });

        await test.step('아이디 에러 메시지 확인', async () => {
            await expect(page.getByTestId('username-error')).toHaveText('아이디를 입력해주세요.');
            // 비밀번호 에러 메시지는 표시되지 않아야 함
            await expect(page.getByTestId('password-error')).not.toBeVisible();
        });
    });
}); 