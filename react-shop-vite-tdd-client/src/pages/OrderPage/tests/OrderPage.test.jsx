import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OrderPage from "../OrderPage";
import { OrderContextProvider } from "../../../contexts/OrderContext";
import { WishlistProvider } from "../../../contexts/WishlistContext";
import { server } from "../../../mocks/server";
import { http } from "msw";

// 테스트에 사용될 Mock 상품 데이터
// 실제 API 응답과 동일한 형태로 구성
const TEST_PRODUCTS_DATA = [
    { name: "America", imagePath: "/images/america.jpeg", price: 1000 },
    { name: "England", imagePath: "/images/england.jpeg", price: 2000 },
    { name: "Portland", imagePath: "/images/portland.jpeg", price: 1500 }
];

// 테스트에 사용될 Mock 옵션 데이터
const TEST_OPTIONS_DATA = [
    { name: "Insurance", price: 500 },
    { name: "Dinner", price: 1000 },
    { name: "FirstClass", price: 2000 }
];

// 금액 표시 형식을 위한 헬퍼 함수
const pricePattern = (type, amount) => {
    // 천 단위 구분자가 있거나 없는 경우 모두 매칭
    // 원/₩ 기호가 있거나 없는 경우 모두 매칭
    return new RegExp(`${type}[:\\s]*(${amount}|${amount.toLocaleString()})(원|₩)?`);
};

// 컴포넌트 렌더링을 위한 헬퍼 함수
// WishlistProvider와 OrderContextProvider로 감싸서 필요한 context 제공
const renderWithProviders = (ui) => {
    return render(
        <WishlistProvider>
            <OrderContextProvider>
                {ui}
            </OrderContextProvider>
        </WishlistProvider>
    );
};

describe("주문 페이지 통합 테스트", () => {
    // 각 테스트 실행 전에 MSW를 사용하여 API 응답을 Mock으로 설정
    beforeEach(() => {
        server.use(
            // 상품 목록 API Mock
            http.get("http://localhost:5003/products", () => {
                return Response.json(TEST_PRODUCTS_DATA);
            }),
            // 옵션 목록 API Mock
            http.get("http://localhost:5003/options", () => {
                return Response.json(TEST_OPTIONS_DATA);
            })
        );
    });

    // 초기 렌더링 상태 테스트
    test("초기 렌더링 시 모든 금액이 0원이다", async () => {
        // OrderPage 컴포넌트 렌더링 (빈 setStep 함수 전달)
        await renderWithProviders(<OrderPage setStep={() => {}} />);
        
        // 초기 상태에서 모든 금액이 0원인지 확인
        expect(await screen.findByText(pricePattern("총 상품 가격", 0))).toBeInTheDocument();
        expect(await screen.findByText(pricePattern("총 옵션 가격", 0))).toBeInTheDocument();
        expect(await screen.findByText(pricePattern("총 금액", 0))).toBeInTheDocument();
    });

    // 상품 및 옵션 선택에 따른 금액 계산 테스트
    test("상품과 옵션 선택 시 총 금액이 올바르게 계산된다", async () => {
        // 사용자 이벤트 시뮬레이션을 위한 설정
        const user = userEvent.setup();
        await renderWithProviders(<OrderPage setStep={() => {}} />);

        // 상품 선택 테스트
        // America 2개 선택 (1,000원 x 2 = 2,000원)
        const americaInput = await screen.findByLabelText("America 수량");
        await user.clear(americaInput);
        await user.type(americaInput, "2");
        expect(await screen.findByText(pricePattern("총 상품 가격", 2000))).toBeInTheDocument();

        // England 1개 추가 선택 (2,000원 x 1 = 2,000원 추가)
        const englandInput = await screen.findByLabelText("England 수량");
        await user.clear(englandInput);
        await user.type(englandInput, "1");
        expect(await screen.findByText(pricePattern("총 상품 가격", 4000))).toBeInTheDocument();

        // 옵션 선택 테스트
        // Insurance 옵션 선택 (500원)
        const insuranceCheckbox = await screen.findByRole("checkbox", { name: "Insurance" });
        await user.click(insuranceCheckbox);
        expect(await screen.findByText(pricePattern("총 옵션 가격", 500))).toBeInTheDocument();

        // Dinner 옵션 추가 선택 (1,000원 추가)
        const dinnerCheckbox = await screen.findByRole("checkbox", { name: "Dinner" });
        await user.click(dinnerCheckbox);
        expect(await screen.findByText(pricePattern("총 옵션 가격", 1500))).toBeInTheDocument();

        // 최종 금액 확인
        // 상품 총액(4,000원) + 옵션 총액(1,500원) = 5,500원
        expect(await screen.findByText(pricePattern("총 금액", 5500))).toBeInTheDocument();
    });

    // 주문하기 버튼 동작 테스트
    test("주문하기 버튼 클릭 시 다음 단계로 이동한다", async () => {
        // setStep 함수를 Mock으로 생성
        const mockSetStep = vi.fn();
        const user = userEvent.setup();
        await renderWithProviders(<OrderPage setStep={mockSetStep} />);

        // 주문하기 버튼 클릭
        const orderButton = await screen.findByRole("button", { name: "주문하기" });
        await user.click(orderButton);

        // setStep이 1로 호출되었는지 확인 (다음 단계로 이동)
        expect(mockSetStep).toHaveBeenCalledWith(1);
    });
}); 