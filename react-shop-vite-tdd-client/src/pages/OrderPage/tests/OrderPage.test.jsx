import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OrderPage from "../OrderPage";
import { OrderContextProvider } from "../../../contexts/OrderContext";
import { WishlistProvider } from "../../../contexts/WishlistContext";
import { server } from "../../../mocks/server";
import { http } from "msw";

// API 응답 데이터
const TEST_PRODUCTS_DATA = [
    { name: "America", imagePath: "/images/america.jpeg", price: 1000 },
    { name: "England", imagePath: "/images/england.jpeg", price: 2000 },
    { name: "Portland", imagePath: "/images/portland.jpeg", price: 1500 }
];

const TEST_OPTIONS_DATA = [
    { name: "Insurance", price: 500 },
    { name: "Dinner", price: 1000 },
    { name: "FirstClass", price: 2000 }
];

// 렌더링 헬퍼 함수
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
    beforeEach(() => {
        server.use(
            http.get("http://localhost:5003/products", () => {
                return Response.json(TEST_PRODUCTS_DATA);
            }),
            http.get("http://localhost:5003/options", () => {
                return Response.json(TEST_OPTIONS_DATA);
            })
        );
    });

    test("초기 렌더링 시 모든 금액이 0원이다", async () => {
        await renderWithProviders(<OrderPage setStep={() => {}} />);
        
        expect(screen.getByText("총 상품 가격: 0원")).toBeInTheDocument();
        expect(screen.getByText("총 옵션 가격: 0원")).toBeInTheDocument();
        expect(screen.getByText("총 금액: 0원")).toBeInTheDocument();
    });

    test("상품과 옵션 선택 시 총 금액이 올바르게 계산된다", async () => {
        const user = userEvent.setup();
        await renderWithProviders(<OrderPage setStep={() => {}} />);

        // 상품 선택
        const americaInput = await screen.findByLabelText("America 수량");
        await user.clear(americaInput);
        await user.type(americaInput, "2");
        expect(screen.getByText("총 상품 가격: 2,000원")).toBeInTheDocument();

        const englandInput = await screen.findByLabelText("England 수량");
        await user.clear(englandInput);
        await user.type(englandInput, "1");
        expect(screen.getByText("총 상품 가격: 4,000원")).toBeInTheDocument();

        // 옵션 선택
        const insuranceCheckbox = await screen.findByRole("checkbox", { name: "Insurance" });
        await user.click(insuranceCheckbox);
        expect(screen.getByText("총 옵션 가격: 500원")).toBeInTheDocument();

        const dinnerCheckbox = await screen.findByRole("checkbox", { name: "Dinner" });
        await user.click(dinnerCheckbox);
        expect(screen.getByText("총 옵션 가격: 1,500원")).toBeInTheDocument();

        // 최종 금액 확인 (상품 4,000원 + 옵션 1,500원 = 5,500원)
        expect(screen.getByText("총 금액: 5,500원")).toBeInTheDocument();
    });

    test("주문하기 버튼 클릭 시 다음 단계로 이동한다", async () => {
        const mockSetStep = vi.fn();
        const user = userEvent.setup();
        await renderWithProviders(<OrderPage setStep={mockSetStep} />);

        const orderButton = screen.getByRole("button", { name: "주문하기" });
        await user.click(orderButton);

        expect(mockSetStep).toHaveBeenCalledWith(1);
    });
}); 