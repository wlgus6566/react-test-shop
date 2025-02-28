import { render, screen } from "../../../test-utils";
import SummaryPage from "../SummaryPage";
import {addConstants} from "jsdom/lib/jsdom/utils.js";
import {readDataTransferFromClipboard} from "@testing-library/user-event/dist/cjs/utils/index.d.ts.js";

test("checkbox and button", () => {
  render(<SummaryPage />);
  const checkbox = screen.getByRole("checkbox", {
    name: "주문하려는 것을 확인하셨나요?",
  });
  expect(checkbox.checked).toBe(false);

  const confirmButton = screen.getByRole("button", { name: "주문 확인" });
  expect(confirmButton.disabled).toBeTruthy();
});
