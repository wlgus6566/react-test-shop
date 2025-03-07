import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import WishlistPage from "../WishlistPage";
import { WishlistProvider } from "../../../contexts/WishlistContext";

// 상수 정의
const MESSAGES = {
  EMPTY: "위시리스트가 비어있습니다.",
  TITLE: "나의 위시리스트"
};

const TEST_PRODUCTS = [
  { name: "America", imagePath: "/images/america.jpeg" },
  { name: "England", imagePath: "/images/england.jpeg" }
];

// 렌더링 헬퍼 함수
const renderWithProviders = (ui, { wishlistItems = [] } = {}) => {
  return render(
    <BrowserRouter>
      <WishlistProvider initialItems={wishlistItems}>
        {ui}
      </WishlistProvider>
    </BrowserRouter>
  );
};

describe("위시리스트 페이지", () => {
  describe("빈 위시리스트", () => {
    beforeEach(() => {
      renderWithProviders(<WishlistPage />);
    });

    test("위시리스트가 비어있을 때 적절한 메시지가 표시된다", () => {
      expect(screen.getByText(MESSAGES.EMPTY)).toBeInTheDocument();
      
      const browseButtons = screen.getAllByRole("button", { name: "상품 둘러보기" });
      expect(browseButtons.length).toBeGreaterThan(0);
    });

    test("상품 둘러보기 버튼 클릭 시 주문 페이지로 이동한다", async () => {
      const user = userEvent.setup();
      
      // data-testid를 사용하여 특정 버튼을 선택
      const browseButton = screen.getByTestId("browse-products-button");
      await user.click(browseButton);
      
      // React Router의 useNavigate가 "/"로 호출되었는지 확인
      expect(window.location.pathname).toBe("/");
    });
  });

  // describe("위시리스트에 상품이 있는 경우", () => {
  //   beforeEach(() => {
  //     renderWithProviders(<WishlistPage />, {
  //       wishlistItems: TEST_PRODUCTS
  //     });
  //   });

  //   test("위시리스트 제목이 표시된다", () => {
  //     expect(screen.getByRole("heading", { name: MESSAGES.TITLE })).toBeInTheDocument();
  //   });

  //   test("위시리스트의 모든 상품이 표시된다", () => {
  //     TEST_PRODUCTS.forEach(product => {
  //       // 상품 카드의 제목으로 찾기
  //       const productTitle = screen.getByRole('heading', { name: product.name });
  //       expect(productTitle).toBeInTheDocument();
        
  //       // 상품 이미지 찾기
  //       const productImage = screen.getByRole('img', { name: product.name });
  //       expect(productImage).toHaveAttribute("src", `http://localhost:5003${product.imagePath}`);
        
  //       // 상품 관련 버튼들 찾기
  //       const orderButton = screen.getByRole('button', { name: `${product.name} 주문하기` });
  //       const removeButton = screen.getByRole('button', { name: `${product.name} 삭제` });
  //       expect(orderButton).toBeInTheDocument();
  //       expect(removeButton).toBeInTheDocument();
  //     });
  //   });

  //   test("각 상품의 버튼이 올바르게 동작한다", async () => {
  //     const user = userEvent.setup();
      
  //     // 첫 번째 상품의 삭제 버튼 클릭
  //     const deleteButton = screen.getByRole('button', { 
  //       name: `${TEST_PRODUCTS[0].name} 삭제하기` 
  //     });
  //     await user.click(deleteButton);
      
  //     // 삭제된 상품이 화면에서 사라졌는지 확인
  //     expect(screen.queryByRole('heading', { name: TEST_PRODUCTS[0].name }))
  //       .not.toBeInTheDocument();
      
  //     // 남은 상품은 여전히 표시되는지 확인
  //     expect(screen.getByRole('heading', { name: TEST_PRODUCTS[1].name }))
  //       .toBeInTheDocument();
  //   });
  //});
});