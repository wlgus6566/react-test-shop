# Vitest 테스트 작성 가이드

## 1. 테스트 파일 구조

테스트 코드는 각 기능 구현체와 가까운 위치에 배치합니다:

```
src/
├── pages/          
│   ├── CompletePage/
│   │   ├── CompletePage.jsx
│   │   ├── tests/  
│   │   │   ├── CompletePage.test.jsx  # 컴포넌트 테스트
│   ├── OrderPage/
│   │   ├── OrderPage.jsx
│   │   ├── tests/  
│   │   │   ├── Type.test.jsx          # 타입 관련 로직 테스트
│   │   │   ├── calculate.test.jsx      # 계산 로직 테스트
├── services/       
│   ├── PaymentService.js
│   ├── tests/                        # 서비스 로직 테스트 폴더
```

## 2. 테스트 케이스 작성 패턴

### 📌 서비스 로직 테스트
CartService 테스트를 예시로 한 서비스 로직 테스트 패턴:

```javascript
describe('Cart Service', () => {
    // 테스트 데이터 설정
    const mockProduct = {
        id: 1,
        name: 'Test Product',
        price: 1000,
        stock: 5
    };

    describe('addToCart', () => {
        test('상품을 장바구니에 추가할 수 있다', () => {
            const cart = new CartService();
            const result = cart.addToCart(mockProduct, 2);

            expect(result.items).toHaveLength(1);
            expect(result.items[0]).toEqual({
                ...mockProduct,
                quantity: 2,
                totalPrice: 2000
            });
        });

        test('재고보다 많은 수량을 추가할 수 없다', () => {
            const cart = new CartService();
            
            expect(() => {
                cart.addToCart(mockProduct, 6);
            }).toThrow('재고가 부족합니다.');
        });

        test('이미 있는 상품의 경우 수량이 증가한다', () => {
            const cart = new CartService();
            
            cart.addToCart(mockProduct, 2);
            const result = cart.addToCart(mockProduct, 1);

            expect(result.items[0].quantity).toBe(3);
            expect(result.items[0].totalPrice).toBe(3000);
        });
    });

    describe('removeFromCart', () => {
        test('상품을 장바구니에서 제거할 수 있다', () => {
            const cart = new CartService();
            
            cart.addToCart(mockProduct, 2);
            const result = cart.removeFromCart(mockProduct.id);

            expect(result.items).toHaveLength(0);
        });

        test('존재하지 않는 상품 제거 시 에러를 던진다', () => {
            const cart = new CartService();
            
            expect(() => {
                cart.removeFromCart(999);
            }).toThrow('상품을 찾을 수 없습니다.');
        });
    });

    describe('calculateTotal', () => {
        test('장바구니 총액이 올바르게 계산된다', () => {
            const cart = new CartService();
            const product2 = { ...mockProduct, id: 2, price: 2000 };
            
            cart.addToCart(mockProduct, 2);  // 2000원
            cart.addToCart(product2, 1);     // 2000원

            const result = cart.calculateTotal();

            expect(result).toEqual({
                subtotal: 4000,
                tax: 400,        // 10% 세금
                total: 4400
            });
        });

        test('할인 쿠폰 적용 시 할인된 금액으로 계산된다', () => {
            const cart = new CartService();
            const coupon = { code: 'SAVE10', discountRate: 10 };
            
            cart.addToCart(mockProduct, 2);  // 2000원
            cart.applyCoupon(coupon);

            const result = cart.calculateTotal();

            expect(result).toEqual({
                subtotal: 2000,
                discount: 200,   // 10% 할인
                tax: 180,        // 할인 후 금액에 대한 10% 세금
                total: 1980
            });
        });
    });
});
```

### 📌 컴포넌트 테스트
SummaryPage 테스트를 예시로 한 컴포넌트 테스트 패턴:

```javascript
describe('SummaryPage', () => {
    // 1. 렌더링 테스트
    test('주문 정보가 올바르게 표시된다', () => {
        renderWithContext(<SummaryPage />);
        
        expect(screen.getByText('총 주문 금액:')).toBeInTheDocument();
        expect(screen.getByText('현재 보유 포인트:')).toBeInTheDocument();
    });

    // 2. 사용자 인터랙션 테스트
    test('포인트 사용 체크박스 선택 시 포인트 입력창이 표시된다', () => {
        renderWithContext(<SummaryPage />);
        
        const checkbox = screen.getByLabelText('포인트 사용하기');
        fireEvent.click(checkbox);
        
        expect(screen.getByLabelText('사용할 포인트:')).toBeInTheDocument();
    });

    // 3. 비즈니스 로직 테스트
    test('유효하지 않은 포인트 입력 시 에러 메시지가 표시된다', () => {
        renderWithContext(<SummaryPage />);
        
        const checkbox = screen.getByLabelText('포인트 사용하기');
        fireEvent.click(checkbox);
        
        const input = screen.getByLabelText('사용할 포인트:');
        fireEvent.change(input, { target: { value: '99999' } });
        
        expect(screen.getByText('보유 포인트보다 많은 금액을 사용할 수 없습니다.')).toBeInTheDocument();
    });
});
```

## 3. 테스트 데이터 관리

### 📌 테스트 데이터 예시
```javascript
// 인증 테스트 데이터
const TEST_USERS = [
    {
        email: 'test@example.com',
        password: 'Password!123',
        name: 'Test User',
        role: 'user'
    },
    {
        email: 'admin@example.com',
        password: 'Admin!123',
        name: 'Admin User',
        role: 'admin'
    }
];

// API 응답 데이터
const TEST_API_RESPONSES = {
    success: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: TEST_USERS[0]
    },
    error: {
        message: '인증에 실패했습니다.'
    }
};
```

### 📌 MSW를 활용한 API 모킹
```javascript
describe('로그인 프로세스', () => {
    beforeEach(() => {
        // API 응답 모킹
        server.use(
            http.post('/api/auth/login', ({ request }) => {
                const { email, password } = request.json();
                const user = TEST_USERS.find(u => u.email === email);

                if (!user || user.password !== password) {
                    return HttpResponse.json(
                        TEST_API_RESPONSES.error,
                        { status: 401 }
                    );
                }

                return HttpResponse.json(TEST_API_RESPONSES.success);
            })
        );
    });

    test('로그인 성공 시 대시보드로 이동한다', async () => {
        // 테스트 구현
    });
});
```
## 4. 테스트 작성 시 주의사항

### 📌 테스트 격리
- 각 테스트는 독립적으로 실행될 수 있어야 합니다
- `beforeEach`에서 상태를 초기화합니다
- 전역 상태를 변경하는 경우 `afterEach`에서 원복합니다

### 📌 테스트 가독성
- 테스트 설명은 구체적으로 작성합니다
- 테스트 준비(Arrange), 실행(Act), 검증(Assert) 단계를 명확히 구분합니다
- 관련 있는 테스트끼리 `describe` 블록으로 그룹화합니다

### 📌 효율적인 테스트
- 중복되는 설정은 `beforeEach`로 분리합니다
- 공통 테스트 데이터는 별도 파일로 관리합니다
- 테스트 유틸리티 함수를 활용합니다 (예: `renderWithContext`)

### 📌 기존 폴더 구조를 확인하고 테스트 파일을 react-shop-vite-tdd-client 폴더 안의 올바른 위치에 생성


