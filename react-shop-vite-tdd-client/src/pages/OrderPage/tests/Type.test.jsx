import { render, screen } from "../../../test-utils";
import userEvent from "@testing-library/user-event";
import Type from "../Type";

describe("상품 및 옵션 선택 테스트", () => {
  test("상품 개수를 변경할 때 총 가격이 올바르게 반영된다.", async () => {
    const user = userEvent.setup();
    render(<Type orderType="products" />);

    const productsTotal = screen.getByText("총 상품 가격:", { exact: false });
    expect(productsTotal).toHaveTextContent(`0원`);

    const americaInput = await screen.findByRole("spinbutton", { name: "America" });

    const testCases = [
      { value: "1", expected: 1000 },
      { value: "3", expected: 3000 },
      { value: "0", expected: 0 },
    ];

    for (const { value, expected } of testCases) {
      await user.clear(americaInput);
      await user.type(americaInput, value);
      expect(productsTotal).toHaveTextContent(`${expected.toLocaleString()}원`);
    }
  });

  test("옵션이 변경될 때 총 옵션 가격이 업데이트되는지 확인", async () => {
    const user = userEvent.setup();
    render(<Type orderType="options" />);

    const optionsTotal = screen.getByText("총 옵션 가격:", { exact: false });
    expect(optionsTotal).toHaveTextContent(`0원`);

    const insuranceCheckbox = await screen.findByRole("checkbox", { name: "Insurance" });
    await user.click(insuranceCheckbox);
    expect(optionsTotal).toHaveTextContent(`500원`);

    const dinnerCheckbox = await screen.findByRole("checkbox", { name: "Dinner" });
    await user.click(dinnerCheckbox);
    expect(optionsTotal).toHaveTextContent(`1,000원`);

    await user.click(dinnerCheckbox); // 옵션 해제
    expect(optionsTotal).toHaveTextContent(`500원`);
  });
});
