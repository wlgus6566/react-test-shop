import { render, screen, waitFor } from "../../../test-utils";
import userEvent from "@testing-library/user-event";
import CompletePage from "../CompletePage";
import { OrderContextProvider } from "../../../contexts/OrderContext";
import { http } from "msw";
import { server } from "../../../mocks/server";

// 상수 정의
const MESSAGES = {
    ERROR: "에러가 발생했습니다.",
    SUCCESS: "주문이 성공했습니다!",
    LOADING: "Loading..."
};

const BUTTONS = {
    HOME: "첫페이지로",
    CLEAR: "주문 내역 초기화"
};

// 테스트 데이터
const TEST_ORDER_HISTORY = [
    { orderNumber: 1234, price: 2000 },
    { orderNumber: 5678, price: 3000 }
];

// 헬퍼 함수
const renderWithContext = (ui) => {
    return render(
        <OrderContextProvider>
            {ui}
        </OrderContextProvider>
    );
};

describe("주문 완료 페이지 테스트", () => {
    describe("로딩 상태", () => {
        test("데이터 로딩 중에는 로딩 표시가 보인다", () => {
            renderWithContext(<CompletePage />);
            
            expect(screen.getByText(MESSAGES.LOADING)).toBeInTheDocument();
            expect(screen.getByRole("status")).toBeInTheDocument();
        });
    });

    describe("에러 처리", () => {
        beforeEach(() => {
            // API 요청이 실패하도록 MSW 핸들러 재정의
            server.use(
                http.get("http://localhost:5003/order-history", () => {
                    return new Response(null, { status: 500 });
                })
            );
        });

        test("API 요청 실패 시 에러 메시지가 표시된다", async () => {
            renderWithContext(<CompletePage />);
            
            const errorBanner = await screen.findByTestId("error-banner");
            expect(errorBanner).toBeInTheDocument();
            expect(errorBanner).toHaveTextContent(MESSAGES.ERROR);
        });
    });

    describe("주문 내역 표시", () => {
        beforeEach(() => {
            // 정상적인 응답을 반환하도록 MSW 핸들러 재정의
            server.use(
                http.get("http://localhost:5003/order-history", () => {
                    return Response.json(TEST_ORDER_HISTORY);
                })
            );
        });

        test("주문 내역이 올바르게 표시된다", async () => {
            renderWithContext(<CompletePage />);

            // 로딩 상태가 사라질 때까지 대기
            await waitFor(() => {
                expect(screen.queryByText(MESSAGES.LOADING)).not.toBeInTheDocument();
            });

            // 성공 메시지 확인
            expect(screen.getByText(MESSAGES.SUCCESS)).toBeInTheDocument();

            // 주문 내역 테이블 확인
            TEST_ORDER_HISTORY.forEach(({ orderNumber, price }) => {
                expect(screen.getByText(orderNumber.toString())).toBeInTheDocument();
                expect(screen.getByText(price.toString())).toBeInTheDocument();
            });
        });

        test("주문 내역 초기화가 정상적으로 동작한다", async () => {
            const user = userEvent.setup();
            const mockSetStep = vi.fn();
            renderWithContext(<CompletePage setStep={mockSetStep} />);

            // 로딩 상태가 사라질 때까지 대기
            await waitFor(() => {
                expect(screen.queryByText(MESSAGES.LOADING)).not.toBeInTheDocument();
            });

            // 초기화 버튼 클릭
            const clearButton = screen.getByRole("button", { name: BUTTONS.CLEAR });
            await user.click(clearButton);

            // 주문 내역이 비워졌는지 확인
            await waitFor(() => {
                TEST_ORDER_HISTORY.forEach(({ orderNumber }) => {
                    expect(screen.queryByText(orderNumber.toString())).not.toBeInTheDocument();
                });
            });
        });

        test("첫 페이지로 버튼 클릭 시 초기 화면으로 이동한다", async () => {
            const user = userEvent.setup();
            const mockSetStep = vi.fn();
            renderWithContext(<CompletePage setStep={mockSetStep} />);

            // 로딩 상태가 사라질 때까지 대기
            await waitFor(() => {
                expect(screen.queryByText(MESSAGES.LOADING)).not.toBeInTheDocument();
            });

            // 첫 페이지로 버튼 클릭
            const homeButton = screen.getByRole("button", { name: BUTTONS.HOME });
            await user.click(homeButton);

            // setStep이 0으로 호출되었는지 확인
            expect(mockSetStep).toHaveBeenCalledWith(0);
        });
    });
}); 