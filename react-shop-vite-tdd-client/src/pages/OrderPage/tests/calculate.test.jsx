import { render, screen } from "../../../test-utils";
import userEvent from "@testing-library/user-event";
import Type from "../Type";
import OrderPage from "../OrderPage";

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

test("옵션이 변경될 때 총 옵션 가격이 업데이트되는지 확인하는 테스트", async () => {
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

describe("total price of goods and options", () => {
  test("total price starts with 0 and updates when adding one product", async () => {
    const user = userEvent.setup();

    render(<OrderPage />);

    const total = screen.getByText("총 금액", { exact: false });
    expect(total).toHaveTextContent(`0원`);

    const americaInput = await screen.findByRole("spinbutton", {
      name: "America",
    });
    await user.clear(americaInput);
    await user.type(americaInput, "1");

    expect(total).toHaveTextContent(`1,000원`);
  });

  test("Updating total price when adding one option", async () => {
    const user = userEvent.setup();

    render(<OrderPage />);
    const total = screen.getByText("총 금액", { exact: false });

    const insuranceCheckbox = await screen.findByRole("checkbox", {
      name: "Insurance",
    });
    await user.click(insuranceCheckbox);
    expect(total).toHaveTextContent(`500원`);
  });

  test("Updating total price when removing option and product", async () => {
    const user = userEvent.setup();

    render(<OrderPage />);
    const total = screen.getByText("총 금액", { exact: false });

    const insuranceCheckbox = await screen.findByRole("checkbox", {
      name: "Insurance",
    });
    await user.click(insuranceCheckbox);

    const americaInput = await screen.findByRole("spinbutton", {
      name: "America",
    });
    await user.clear(americaInput);
    await user.type(americaInput, "3");

    await user.clear(americaInput);
    await user.type(americaInput, "1");

    expect(total).toHaveTextContent(`1,500원`);
  });
});
