import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Type from "../Type";
import { OrderContextProvider } from "../../../contexts/OrderContext";
import { WishlistProvider } from "../../../contexts/WishlistContext";
import { server } from "../../../mocks/server";
import { http } from "msw";

// 상수 정의
const PRODUCTS = {
    AMERICA: {
        name: "America",
        price: 1000
    },
    ENGLAND: {
        name: "England",
        price: 1000
    }
};

const OPTIONS = {
    INSURANCE: {
        name: "Insurance",
        price: 500
    },
    DINNER: {
        name: "Dinner",
        price: 500
    }
};

// API 응답 데이터
const TEST_PRODUCTS_DATA = [
    { name: "America", imagePath: "/images/america.jpg", price: 1000 },
    { name: "England", imagePath: "/images/england.jpg", price: 1000 }
];

const TEST_OPTIONS_DATA = [
    { name: "Insurance", imagePath: "/images/insurance.png", price: 500 },
    { name: "Dinner", imagePath: "/images/dinner.png", price: 500 }
];

// 헬퍼 함수
const findAndTypeInput = async (user, name, value) => {
    const input = await screen.findByLabelText(`${name} 수량`);
    await user.clear(input);
    await user.type(input, value);
    return input;
};

const findAndToggleOption = async (user, name) => {
    const checkbox = await screen.findByRole("checkbox", { name });
    await user.click(checkbox);
    return checkbox;
};

const getTotalText = (type) => {
    const prefix = type === "products" ? "총 상품 가격: " : "총 옵션 가격: ";
    const element = screen.getByText(new RegExp(`^${prefix}`));
    return element;
};

const formatPrice = (price) => `${price.toLocaleString()}원`;

// 렌더링 헬퍼 함수 수정
const renderWithProviders = (ui) => {
    return render(
        <WishlistProvider>
            <OrderContextProvider>
                {ui}
            </OrderContextProvider>
        </WishlistProvider>
    );
};

describe("상품 및 옵션 선택 테스트", () => {
    describe("상품 선택 테스트", () => {
        beforeEach(() => {
            server.use(
                http.get("http://localhost:5003/products", () => {
                    return Response.json(TEST_PRODUCTS_DATA);
                })
            );
        });

        test("초기 상품 가격은 0원이다", () => {
            renderWithProviders(<Type orderType="products" />);
            const total = getTotalText("products");
            expect(total).toHaveTextContent("총 상품 가격: 0원");
        });

        test("상품 개수 변경 시 총 가격이 올바르게 계산된다", async () => {
            const user = userEvent.setup();
            renderWithProviders(<Type orderType="products" />);
            const testCases = [
                { product: "America", quantity: "2", expected: 2000 },
                { product: "America", quantity: "3", expected: 3000 },
                { product: "England", quantity: "1", expected: 4000 },
                { product: "England", quantity: "0", expected: 3000 },
                { product: "America", quantity: "0", expected: 0 }
            ];

            const total = getTotalText("products");
            
            for (const { product, quantity, expected } of testCases) {
                await findAndTypeInput(user, product, quantity);
                expect(total).toHaveTextContent(`총 상품 가격: ${formatPrice(expected)}`);
            }
        });
    });

    describe("옵션 선택 테스트", () => {
        beforeEach(() => {
            server.use(
                http.get("http://localhost:5003/options", () => {
                    return Response.json(TEST_OPTIONS_DATA);
                })
            );
        });

        test("초기 옵션 가격은 0원이다", () => {
            renderWithProviders(<Type orderType="options" />);
            const total = getTotalText("options");
            expect(total).toHaveTextContent("총 옵션 가격: 0원");
        });

        test("옵션 체크박스 토글 시 총 가격이 올바르게 계산된다", async () => {
            const user = userEvent.setup();
            renderWithProviders(<Type orderType="options" />);
            const total = getTotalText("options");

            // Insurance 선택
            await findAndToggleOption(user, OPTIONS.INSURANCE.name);
            expect(total).toHaveTextContent(`총 옵션 가격: ${formatPrice(OPTIONS.INSURANCE.price)}`);

            // Dinner 추가 선택
            await findAndToggleOption(user, OPTIONS.DINNER.name);
            expect(total).toHaveTextContent(`총 옵션 가격: ${formatPrice(OPTIONS.INSURANCE.price + OPTIONS.DINNER.price)}`);

            // Insurance 선택 해제
            await findAndToggleOption(user, OPTIONS.INSURANCE.name);
            expect(total).toHaveTextContent(`총 옵션 가격: ${formatPrice(OPTIONS.DINNER.price)}`);

            // Dinner 선택 해제
            await findAndToggleOption(user, OPTIONS.DINNER.name);
            expect(total).toHaveTextContent("총 옵션 가격: 0원");
        });
    });
});
