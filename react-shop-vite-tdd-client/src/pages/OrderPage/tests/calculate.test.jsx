import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { act } from '@testing-library/react';
import Type from "../Type";
import { OrderContextProvider } from "../../../contexts/OrderContext";
import { WishlistProvider } from "../../../contexts/WishlistContext";
import OrderPage from "../OrderPage";

// 테스트용 상품과 옵션 데이터
const PRODUCTS = [
  {
    name: 'America',
    imagePath: '/images/america.jpeg',
    description: 'Good America',
    price: 1000
  },
  {
    name: 'England',
    imagePath: '/images/england.jpeg',
    description: 'Good England',
    price: 2000
  }
];

const OPTIONS = [
  {
    name: 'Insurance',
    description: '안전한 여행을 위해서!',
    price: 500
  },
  {
    name: 'Dinner',
    description: '맛있는 저녁과 함께하는 여행!',
    price: 500
  }
];

// API 모킹 설정
beforeEach(() => {
  // fetch 모킹
  global.fetch = vi.fn((url) => {
    if (url.includes('/products')) {
      return Promise.resolve({
        json: () => Promise.resolve(PRODUCTS)
      });
    }
    if (url.includes('/options')) {
      return Promise.resolve({
        json: () => Promise.resolve(OPTIONS)
      });
    }
  });
});

// 렌더링 헬퍼 함수
const renderWithProviders = async (ui) => {
  let result;
  await act(async () => {
    result = render(
      <WishlistProvider>
        <OrderContextProvider>
          {ui}
        </OrderContextProvider>
      </WishlistProvider>
    );
  });
  return result;
};

// 테스트 헬퍼 함수
const setupTest = async (component) => {
  const user = userEvent.setup();
  await renderWithProviders(component);
  return user;
};

const formatPrice = (price) => `${price.toLocaleString()}원`;

describe("상품 가격 계산 테스트", () => {
  test("상품 개수를 변경할 때 총 가격이 올바르게 반영된다", async () => {
    const user = await setupTest(<Type orderType="products" />);
    const productsTotal = screen.getByText("총 상품 가격", { exact: false });
    
    expect(productsTotal).toHaveTextContent(formatPrice(0));

    const testCases = [
      { value: "1", expected: PRODUCTS[0].price },
      { value: "3", expected: PRODUCTS[0].price * 3 },
      { value: "0", expected: 0 },
    ];

    for (const { value, expected } of testCases) {
      const input = await screen.findByLabelText(`${PRODUCTS[0].name} 수량`);
      await act(async () => {
        await user.clear(input);
        await user.type(input, value);
      });
      expect(productsTotal).toHaveTextContent(formatPrice(expected));
    }  
  });
});

describe("옵션 가격 계산", () => {
  test("옵션이 변경될 때 총 옵션 가격이 올바르게 업데이트된다", async () => {
    const user = await setupTest(<Type orderType="options" />);
    const optionsTotal = screen.getByText("총 옵션 가격", { exact: false });
    
    expect(optionsTotal).toHaveTextContent(formatPrice(0));

    // 보험 옵션 추가
    const insuranceCheckbox = await screen.findByLabelText(OPTIONS[0].name);
    await act(async () => {
      await user.click(insuranceCheckbox);
    });
    expect(optionsTotal).toHaveTextContent(formatPrice(OPTIONS[0].price));

    // 저녁 식사 옵션 추가
    const dinnerCheckbox = await screen.findByLabelText(OPTIONS[1].name);
    await act(async () => {
      await user.click(dinnerCheckbox);
    });
    expect(optionsTotal).toHaveTextContent(formatPrice(OPTIONS[0].price + OPTIONS[1].price));

    // 저녁 식사 옵션 제거
    await act(async () => {
      await user.click(dinnerCheckbox);
    });
    expect(optionsTotal).toHaveTextContent(formatPrice(OPTIONS[0].price));
  });
});

describe("상품과 옵션의 총 금액 계산", () => {
  test("상품 하나를 추가했을 때 총 금액이 올바르게 계산된다", async () => {
    const user = await setupTest(<OrderPage />);
    const total = screen.getByText("총 금액", { exact: false });
    
    expect(total).toHaveTextContent(formatPrice(0));

    const input = await screen.findByLabelText(`${PRODUCTS[0].name} 수량`);
    await act(async () => {
      await user.clear(input);
      await user.type(input, "1");
    });
    expect(total).toHaveTextContent(formatPrice(PRODUCTS[0].price));
  });

  test("옵션 하나를 추가했을 때 총 금액이 올바르게 계산된다", async () => {
    const user = await setupTest(<OrderPage />);
    const total = screen.getByText("총 금액", { exact: false });

    const insuranceCheckbox = await screen.findByLabelText(OPTIONS[0].name);
    await act(async () => {
      await user.click(insuranceCheckbox);
    });
    expect(total).toHaveTextContent(formatPrice(OPTIONS[0].price));
  });

  test("옵션과 상품을 추가하고 제거할 때 총 금액이 올바르게 계산된다", async () => {
    const user = await setupTest(<OrderPage />);
    const total = screen.getByText("총 금액", { exact: false });

    // 보험 옵션 추가
    const insuranceCheckbox = await screen.findByLabelText(OPTIONS[0].name);
    await act(async () => {
      await user.click(insuranceCheckbox);
    });

    // 상품 3개 추가 후 1개로 수정
    const input = await screen.findByLabelText(`${PRODUCTS[0].name} 수량`);
    await act(async () => {
      await user.clear(input);
      await user.type(input, "3");
      await user.clear(input);
      await user.type(input, "1");
    });

    const expectedTotal = PRODUCTS[0].price + OPTIONS[0].price;
    expect(total).toHaveTextContent(formatPrice(expectedTotal));
  });
});
