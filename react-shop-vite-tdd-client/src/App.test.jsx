import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

// 상수 정의
const PRODUCTS = {
  AMERICA: 'America',
  ENGLAND: 'England'
};

const OPTIONS = {
  INSURANCE: 'Insurance'
};

// 테스트 헬퍼 함수
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

const findAndClickButton = async (user, name) => {
  const button = screen.getByRole("button", { name });
  await user.click(button);
  return button;
};

describe("주문 프로세스 테스트", () => {
  test("상품 주문부터 주문 완료까지의 전체 흐름", async () => {
    const user = userEvent.setup();
    render(<App />);

    // 1. 상품 선택 페이지
    await findAndTypeInput(user, PRODUCTS.AMERICA, "2");
    await findAndTypeInput(user, PRODUCTS.ENGLAND, "3");
    await findAndClickCheckbox(user, OPTIONS.INSURANCE);
    await findAndClickButton(user, "주문하기");

    // 2. 주문 확인 페이지
    const summaryHeading = screen.getByRole("heading", { name: "주문 확인" });
    expect(summaryHeading).toBeInTheDocument();

    // 총 주문 금액 확인
    const totalHeading = screen.getByRole("heading", { name: /총 주문 금액: 5,500원/ });
    expect(totalHeading).toBeInTheDocument();

    // 포인트 확인
    const pointsHeading = screen.getByRole("heading", { name: /현재 보유 포인트: 5,000원/ });
    expect(pointsHeading).toBeInTheDocument();

    // 선택한 상품 확인
    const selectedItems = screen.getByTestId("selected-items");
    expect(selectedItems).toHaveTextContent("2 America");
    expect(selectedItems).toHaveTextContent("3 England");
    expect(selectedItems).toHaveTextContent("Insurance");

    // 주문 확인 및 진행
    await findAndClickCheckbox(user, "주문을 확인하셨나요?");
    const submitButton = screen.getByRole("button", { name: "결제하기" });
    await user.click(submitButton);

    // 3. 주문 완료 페이지
    // 로딩 상태 확인
    await screen.findByText(/Loading/i);

    // 주문 완료 확인
    const completeHeader = await screen.findByRole("heading", {
      name: "주문이 성공했습니다!",
    });
    expect(completeHeader).toBeInTheDocument();

    // 로딩 상태 사라짐 확인
    expect(screen.queryByText("loading")).not.toBeInTheDocument();

    // 4. 첫 페이지로 돌아가기
    await findAndClickButton(user, "첫페이지로");

    // 초기 상태 확인
    await waitFor(() => {
      expect(screen.getByText(/총 상품 가격: 0원/)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/총 옵션 가격: 0원/)).toBeInTheDocument();
    });

    // America 입력 필드가 다시 나타나는지 확인
    await waitFor(() => {
      expect(screen.getByRole("spinbutton", { name: PRODUCTS.AMERICA })).toBeInTheDocument();
    });
  });
});
