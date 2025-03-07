import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

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

describe("주문 프로세스 테스트", () => {
  test("상품 주문부터 주문 완료까지의 전체 흐름", async () => {
    const user = userEvent.setup();
    render(<App />);

    // 로그인 페이지에서 로그인
    const usernameInput = screen.getByLabelText("아이디");
    const passwordInput = screen.getByLabelText("비밀번호");
    await user.type(usernameInput, "Mozelle34");
    await user.type(passwordInput, "password123");
    await user.click(screen.getByRole("button", { name: "로그인" }));

    // 상품 선택
    await findAndTypeInput(user, "America", "2");
    await findAndTypeInput(user, "England", "1");

    // 옵션 선택
    await findAndClickCheckbox(user, "Insurance");

    // 주문하기 버튼 클릭
    const orderButton = screen.getByRole("button", { name: "주문하기" });
    await user.click(orderButton);

    // 주문 확인 체크박스 선택
    const confirmCheckbox = screen.getByRole("checkbox", {
      name: "주문을 확인하셨나요?",
    });
    await user.click(confirmCheckbox);

    // 결제하기 버튼 클릭
    const payButton = screen.getByRole("button", { name: "결제하기" });
    await user.click(payButton);

    // 주문 완료 페이지 확인
    const completeHeader = await screen.findByRole("heading", {
      name: "주문이 성공했습니다!",
    });
    expect(completeHeader).toBeInTheDocument();

    // 첫페이지로 버튼 클릭
    const returnButton = screen.getByRole("button", { name: "첫페이지로" });
    await user.click(returnButton);

    // 초기 화면으로 돌아왔는지 확인
    const productsTotal = screen.getByText("총 상품 가격:", { exact: false });
    expect(productsTotal).toHaveTextContent("0원");
  });
}); 