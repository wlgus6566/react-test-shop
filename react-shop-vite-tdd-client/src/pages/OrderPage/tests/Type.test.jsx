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
    { name: "England", imagePath: "/images/england.jpeg", price: 2000 }
];

const TEST_OPTIONS_DATA = [
    { name: "Insurance", price: 500 },
    { name: "Dinner", price: 1000 }
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

describe("Type 컴포넌트 단위 테스트", () => {
    describe("상품 타입 테스트", () => {
        beforeEach(() => {
            server.use(
                http.get("http://localhost:5003/products", () => {
                    return Response.json(TEST_PRODUCTS_DATA);
                })
            );
        });

        test("상품 목록이 올바르게 렌더링된다", async () => {
            await renderWithProviders(<Type orderType="products" />);
            
            // 상품 이름과 가격이 표시되는지 확인
            expect(await screen.findByText("America")).toBeInTheDocument();
            expect(await screen.findByText("1,000원")).toBeInTheDocument();
            expect(await screen.findByText("England")).toBeInTheDocument();
            expect(await screen.findByText("2,000원")).toBeInTheDocument();
        });

        test("상품 수량 입력 필드가 존재한다", async () => {
            await renderWithProviders(<Type orderType="products" />);
            
            expect(await screen.findByLabelText("America 수량")).toBeInTheDocument();
            expect(await screen.findByLabelText("England 수량")).toBeInTheDocument();
        });
    });

    describe("옵션 타입 테스트", () => {
        beforeEach(() => {
            server.use(
                http.get("http://localhost:5003/options", () => {
                    return Response.json(TEST_OPTIONS_DATA);
                })
            );
        });

        test("옵션 목록이 올바르게 렌더링된다", async () => {
            await renderWithProviders(<Type orderType="options" />);
            
            // 옵션 이름과 체크박스가 표시되는지 확인
            expect(await screen.findByRole("checkbox", { name: "Insurance" })).toBeInTheDocument();
            expect(await screen.findByRole("checkbox", { name: "Dinner" })).toBeInTheDocument();
        });

        test("에러 발생 시 에러 배너가 표시된다", async () => {
            server.use(
                http.get("http://localhost:5003/options", () => {
                    return Response.error();
                })
            );

            await renderWithProviders(<Type orderType="options" />);
            expect(await screen.findByText("에러가 발생했습니다.")).toBeInTheDocument();
        });
    });
});
