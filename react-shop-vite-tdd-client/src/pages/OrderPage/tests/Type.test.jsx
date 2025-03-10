import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from '@testing-library/react';
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
        price: 2000
    },
    PORTLAND: {
        name: "Portland",
        price: 1500
    }
};

const OPTIONS = {
    INSURANCE: {
        name: "Insurance",
        price: 500
    },
    DINNER: {
        name: "Dinner",
        price: 1000
    },
    FIRSTCLASS: {
        name: "FirstClass",
        price: 2000
    }
};

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

describe("상품 및 옵션 선택 테스트", () => {
    describe("상품 선택 테스트", () => {

         // 각 테스트 실행 전에 서버 응답을 Mock 처리하여 상품 데이터를 반환하도록 설정
        beforeEach(() => {
            server.use(
                http.get("http://localhost:5003/products", () => {
                    return Response.json(TEST_PRODUCTS_DATA);
                })
            );
        });

        test("초기 상품 가격은 0원이다", async () => {
            // 주문 타입을 "products"로 설정하여 해당 UI를 렌더링
            await renderWithProviders(<Type orderType="products" />);
            const total = screen.getByText(/^총 상품 가격:/);
            expect(total).toHaveTextContent("총 상품 가격: 0원");
        });

        test("상품 개수 변경 시 총 가격이 올바르게 계산된다", async () => {
            // 사용자 이벤트를 설정 (ex. 클릭, 입력 등)
            const user = userEvent.setup();
            await renderWithProviders(<Type orderType="products" />);
            
            // America 2개 선택 (2000원)
            const americaInput = await screen.findByLabelText("America 수량");
            await user.clear(americaInput);
            await user.type(americaInput, "2");
            expect(screen.getByText(/^총 상품 가격:/)).toHaveTextContent("총 상품 가격: 2,000원");

            // England 1개 추가 (+ 2000원 = 4000원)
            const englandInput = await screen.findByLabelText("England 수량");
            await user.clear(englandInput);
            await user.type(englandInput, "1");
            expect(screen.getByText(/^총 상품 가격:/)).toHaveTextContent("총 상품 가격: 4,000원");

            // Portland 2개 추가 (+ 3000원 = 7000원)
            const portlandInput = await screen.findByLabelText("Portland 수량");
            await user.clear(portlandInput);
            await user.type(portlandInput, "2");
            expect(screen.getByText(/^총 상품 가격:/)).toHaveTextContent("총 상품 가격: 7,000원");
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

        test("초기 옵션 가격은 0원이다", async () => {
            await renderWithProviders(<Type orderType="options" />);
            const total = screen.getByText(/^총 옵션 가격:/);
            expect(total).toHaveTextContent("총 옵션 가격: 0원");
        });

        test("옵션 체크박스 토글 시 총 가격이 올바르게 계산된다", async () => {
            const user = userEvent.setup();
            await renderWithProviders(<Type orderType="options" />);

            // Insurance 선택 (500원)
            const insuranceCheckbox = await screen.findByRole("checkbox", { name: "Insurance" });
            await user.click(insuranceCheckbox);
            expect(screen.getByText(/^총 옵션 가격:/)).toHaveTextContent("총 옵션 가격: 500원");

            // Dinner 추가 선택 (+ 1000원 = 1500원)
            const dinnerCheckbox = await screen.findByRole("checkbox", { name: "Dinner" });
            await user.click(dinnerCheckbox);
            expect(screen.getByText(/^총 옵션 가격:/)).toHaveTextContent("총 옵션 가격: 1,500원");

            // FirstClass 추가 선택 (+ 2000원 = 3500원)
            const firstClassCheckbox = await screen.findByRole("checkbox", { name: "FirstClass" });
            await user.click(firstClassCheckbox);
            expect(screen.getByText(/^총 옵션 가격:/)).toHaveTextContent("총 옵션 가격: 3,500원");
        });
    });
});
