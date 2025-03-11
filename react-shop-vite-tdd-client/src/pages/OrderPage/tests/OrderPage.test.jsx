import { render, screen, act, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OrderPage from "../OrderPage";
import { OrderContextProvider } from "../../../contexts/OrderContext";
import { WishlistProvider } from "../../../contexts/WishlistContext";
import { server } from "../../../mocks/server";
import { http, HttpResponse } from "msw";

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

const EMPTY_PRODUCTS = {
    products: []
};

const EMPTY_OPTIONS = {
    options: []
};

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
    beforeEach(() => {
        server.use(
            http.get("http://localhost:5003/products", () => {
                return HttpResponse.json(TEST_PRODUCTS_DATA);
            }),
            http.get("http://localhost:5003/options", () => {
                return HttpResponse.json(TEST_OPTIONS_DATA);
            })
        );
    });

    test("초기 렌더링 시 모든 금액이 0원이다", async () => {
        await act(async () => {
            renderWithProviders(<OrderPage setStep={() => {}} />);
        });
        
        expect(await screen.findByText(pricePattern("총 상품 가격", 0))).toBeInTheDocument();
        expect(await screen.findByText(pricePattern("총 옵션 가격", 0))).toBeInTheDocument();
        expect(await screen.findByText(pricePattern("총 금액", 0))).toBeInTheDocument();
    });

    test("상품과 옵션 선택 시 총 금액이 올바르게 계산된다", async () => {
        const user = userEvent.setup();
        
        await act(async () => {
            renderWithProviders(<OrderPage setStep={() => {}} />);
        });

        const americaInput = await screen.findByLabelText("America 수량");
        await act(async () => {
            await user.clear(americaInput);
            await user.type(americaInput, "2");
        });
        
        expect(await screen.findByText(pricePattern("총 상품 가격", 2000))).toBeInTheDocument();

        const englandInput = await screen.findByLabelText("England 수량");
        await act(async () => {
            await user.clear(englandInput);
            await user.type(englandInput, "1");
        });
        
        expect(await screen.findByText(pricePattern("총 상품 가격", 4000))).toBeInTheDocument();

        const insuranceCheckbox = await screen.findByRole("checkbox", { name: "Insurance" });
        await act(async () => {
            await user.click(insuranceCheckbox);
        });
        
        expect(await screen.findByText(pricePattern("총 옵션 가격", 500))).toBeInTheDocument();

        const dinnerCheckbox = await screen.findByRole("checkbox", { name: "Dinner" });
        await act(async () => {
            await user.click(dinnerCheckbox);
        });
        
        expect(await screen.findByText(pricePattern("총 옵션 가격", 1500))).toBeInTheDocument();
        expect(await screen.findByText(pricePattern("총 금액", 5500))).toBeInTheDocument();
    });

    test("주문하기 버튼 클릭 시 다음 단계로 이동한다", async () => {
        const mockSetStep = vi.fn();
        const user = userEvent.setup();
        
        await act(async () => {
            renderWithProviders(<OrderPage setStep={mockSetStep} />);
        });

        const orderButton = await screen.findByRole("button", { name: "주문하기" });
        await act(async () => {
            await user.click(orderButton);
        });

        expect(mockSetStep).toHaveBeenCalledWith(1);
    });

    test('renders no data message when product list is empty', async () => {
        server.use(
            http.get('http://localhost:5003/products', () => {
                return HttpResponse.json(EMPTY_PRODUCTS);
            }),
            http.get('http://localhost:5003/options', () => {
                return HttpResponse.json(EMPTY_OPTIONS);
            })
        );

        await act(async () => {
            renderWithProviders(<OrderPage />);
        });
        
        // 상품과 옵션 섹션 모두에서 '데이터가 없습니다' 메시지가 표시되는지 확인
        const noDataMessages = await screen.findAllByText('데이터가 없습니다');
        expect(noDataMessages).toHaveLength(2);
        
        // 상품 섹션 확인
        const productsSection = screen.getByText('상품 선택').closest('.card');
        expect(within(productsSection).getByText('데이터가 없습니다')).toBeInTheDocument();
        
        // 옵션 섹션 확인
        const optionsSection = screen.getByText('옵션 선택').closest('.card');
        expect(within(optionsSection).getByText('데이터가 없습니다')).toBeInTheDocument();
        
        // 수량 입력 필드가 없는지 확인
        expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    });

    test('가격 필터가 올바르게 작동한다', async () => {
        const user = userEvent.setup();
        
        await act(async () => {
            renderWithProviders(<OrderPage setStep={() => {}} />);
        });

        // 상품 섹션의 가격 필터 선택
        const productsSection = screen.getByText('상품 선택').closest('.card');
        const productFilter = within(productsSection).getByRole('combobox', { name: '가격 필터' });
        
        // 1000원 이하 필터 적용
        await act(async () => {
            await user.selectOptions(productFilter, '1000');
        });

        // 1000원 이하 상품만 표시되는지 확인 (America만 표시)
        const productsAfterFilter = within(productsSection).getAllByRole('spinbutton');
        expect(productsAfterFilter).toHaveLength(1);
        expect(screen.getByLabelText('America 수량')).toBeInTheDocument();
        expect(screen.queryByLabelText('England 수량')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Portland 수량')).not.toBeInTheDocument();

        // 옵션 섹션의 가격 필터 선택
        const optionsSection = screen.getByText('옵션 선택').closest('.card');
        const optionFilter = within(optionsSection).getByRole('combobox', { name: '가격 필터' });
        
        // 1000원 이하 필터 적용
        await act(async () => {
            await user.selectOptions(optionFilter, '1000');
        });

        // 1000원 이하 옵션만 표시되는지 확인 (Insurance, Dinner만 표시)
        const optionsAfterFilter = within(optionsSection).getAllByRole('checkbox');
        expect(optionsAfterFilter).toHaveLength(2);
        expect(screen.getByLabelText('Insurance')).toBeInTheDocument();
        expect(screen.getByLabelText('Dinner')).toBeInTheDocument();
        expect(screen.queryByLabelText('FirstClass')).not.toBeInTheDocument();
    });

    test('가격 필터 적용 후 모든 항목이 필터링되면 no data 메시지가 표시된다', async () => {
        const user = userEvent.setup();
        
        await act(async () => {
            renderWithProviders(<OrderPage setStep={() => {}} />);
        });

        // 상품 섹션의 가격 필터 선택
        const productsSection = screen.getByText('상품 선택').closest('.card');
        const productFilter = within(productsSection).getByRole('combobox', { name: '가격 필터' });
        
        // 500원 이하 필터 적용 (모든 상품이 필터링됨)
        await act(async () => {
            await user.selectOptions(productFilter, '500');
        });

        // '데이터가 없습니다' 메시지 확인
        expect(within(productsSection).getByText('데이터가 없습니다')).toBeInTheDocument();
        expect(within(productsSection).queryByRole('spinbutton')).not.toBeInTheDocument();
    });
}); 