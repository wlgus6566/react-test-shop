import {processPayment} from "../processPayment.js";

describe("processPayment 함수 테스트", () => {

    test("포인트를 사용하지 않는 경우, 결제는 항상 성공해야 함", () => {
        const result = processPayment(5000, 3000, false);
        expect(result.success).toBe(true);
        expect(result.remainingPoints).toBe(5000); // 기존 포인트 유지
    });

    test("포인트를 사용할 때, 충분한 포인트가 있으면 결제 성공", () => {
        const result = processPayment(5000, 3000, true);
        expect(result.success).toBe(true);
        expect(result.remainingPoints).toBe(2000); // 포인트 차감됨
    });

    test("포인트를 사용할 때, 포인트가 결제 금액과 같으면 0원이 남아야 함", () => {
        const result = processPayment(5000, 5000, true);
        expect(result.success).toBe(true);
        expect(result.remainingPoints).toBe(0); // 포인트 전부 사용됨
    });

    test("포인트를 사용할 때, 포인트가 부족하면 에러 발생", () => {
        expect(() => processPayment(2000, 3000, true)).toThrow("포인트가 부족합니다.");
    });

    test("포인트를 사용할 때, 0포인트로 0원 결제는 가능해야 함", () => {
        const result = processPayment(0, 0, true);
        expect(result.success).toBe(true);
        expect(result.remainingPoints).toBe(0);
    });

    test("포인트를 사용하지 않을 때, 결제 금액이 0원이면 그대로 유지", () => {
        const result = processPayment(5000, 0, false);
        expect(result.success).toBe(true);
        expect(result.remainingPoints).toBe(5000); // 변화 없음
    });

    test("포인트를 사용할 때, 결제 금액이 0원이면 포인트도 차감되지 않아야 함", () => {
        const result = processPayment(5000, 0, true);
        expect(result.success).toBe(true);
        expect(result.remainingPoints).toBe(5000);
    });
});
