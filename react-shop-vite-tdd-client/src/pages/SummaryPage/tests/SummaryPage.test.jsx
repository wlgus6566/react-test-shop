import { render, screen } from "../../../test-utils";
import SummaryPage from "../SummaryPage";

test("checkbox and button", () => {
  render(<SummaryPage />);

  const checkbox = screen.getByRole("checkbox", {
    name: "주문을 확인하셨나요?",
  });
  expect(checkbox.checked).toBe(false);

  const confirmButton = screen.getByRole("button", { name: "결제하기" });
  expect(confirmButton.disabled).toBeTruthy();
});
