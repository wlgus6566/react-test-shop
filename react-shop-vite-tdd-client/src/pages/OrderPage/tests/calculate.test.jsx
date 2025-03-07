import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Type from "../Type";
import { OrderContextProvider } from "../../../contexts/OrderContext";
import { WishlistProvider } from "../../../contexts/WishlistContext";
import OrderPage from "../OrderPage";

// 상수 정의
const PRICES = {
  PRODUCT_UNIT: 1000,
  OPTION_UNIT: 500
};

const PRODUCTS = {
  AMERICA: 'America',
  ENGLAND: 'England'
};

const OPTIONS = {
  INSURANCE: 'Insurance',
  DINNER: 'Dinner'
};

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

// 테스트 헬퍼 함수
const setupTest = (component) => {
  const user = userEvent.setup();
  renderWithProviders(component);
  return user;
};

const formatPrice = (price) => `${price.toLocaleString()}원`;

const findAndTypeInput = async (user, name, value) => {
  const input = await screen.findByRole("spinbutton", { name });
  await user.clear(input);
  await user.type(input, value);
  return input;
};

const findAndClickCheckbox = async (user, name) => {
  const checkbox = await screen.findByRole("checkbox", { name });
  await user.click(checkbox);
  return checkbox;
};

describe("상품 가격 계산 테스트", () => {
  test("상품 개수를 변경할 때 총 가격이 올바르게 반영된다", async () => {
    const user = setupTest(<Type orderType="products" />);
    const productsTotal = screen.getByText("총 상품 가격:", { exact: false });
    
    expect(productsTotal).toHaveTextContent(formatPrice(0));

    const testCases = [
      { value: "1", expected: PRICES.PRODUCT_UNIT },
      { value: "3", expected: PRICES.PRODUCT_UNIT * 3 },
      { value: "0", expected: 0 },
    ];

    for (const { value, expected } of testCases) {
      await findAndTypeInput(user, PRODUCTS.AMERICA, value);
      expect(productsTotal).toHaveTextContent(formatPrice(expected));
    }  
  });
});

describe("옵션 가격 계산", () => {
  test("옵션이 변경될 때 총 옵션 가격이 올바르게 업데이트된다", async () => {
    const user = setupTest(<Type orderType="optio ns" />);
    const optionsTotal = screen.getByText("총 옵션 가격:", { exact: false });
    
    expect(optionsTotal).toHaveTextContent(formatPrice(0));

    // 보험 옵션 추가
    await findAndClickCheckbox(user, OPTIONS.INSURANCE);
    expect(optionsTotal).toHaveTextContent(formatPrice(PRICES.OPTION_UNIT));

    // 저녁 식사 옵션 추가
    await findAndClickCheckbox(user, OPTIONS.DINNER);
    expect(optionsTotal).toHaveTextContent(formatPrice(PRICES.OPTION_UNIT * 2));

    // 저녁 식사 옵션 제거
    await findAndClickCheckbox(user, OPTIONS.DINNER);
    expect(optionsTotal).toHaveTextContent(formatPrice(PRICES.OPTION_UNIT));
  });
});

describe("상품과 옵션의 총 금액 계산", () => {
  test("상품 하나를 추가했을 때 총 금액이 올바르게 계산된다", async () => {
    const user = setupTest(<OrderPage />);
    const total = screen.getByText("총 금액", { exact: false });
    
    expect(total).toHaveTextContent(formatPrice(0));

    await findAndTypeInput(user, PRODUCTS.AMERICA, "1");
    expect(total).toHaveTextContent(formatPrice(PRICES.PRODUCT_UNIT));
  });

  test("옵션 하나를 추가했을 때 총 금액이 올바르게 계산된다", async () => {
    const user = setupTest(<OrderPage />);
    const total = screen.getByText("총 금액", { exact: false });

    await findAndClickCheckbox(user, OPTIONS.INSURANCE);
    expect(total).toHaveTextContent(formatPrice(PRICES.OPTION_UNIT));
  });

  test("옵션과 상품을 추가하고 제거할 때 총 금액이 올바르게 계산된다", async () => {
    const user = setupTest(<OrderPage />);
    const total = screen.getByText("총 금액", { exact: false });

    // 보험 옵션 추가
    await findAndClickCheckbox(user, OPTIONS.INSURANCE);

    // 상품 3개 추가 후 1개로 수정
    await findAndTypeInput(user, PRODUCTS.AMERICA, "3");
    await findAndTypeInput(user, PRODUCTS.AMERICA, "1");

    const expectedTotal = PRICES.PRODUCT_UNIT + PRICES.OPTION_UNIT;
    expect(total).toHaveTextContent(formatPrice(expectedTotal));
  });
});
