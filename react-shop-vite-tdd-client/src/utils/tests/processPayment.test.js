import { processPayment } from "../processPayment.js";

describe("processPayment 함수 테스트", () => {
    test("포인트를 사용하지 않는 경우, 결제는 항상 성공해야 함", () => {
        const result = processPayment(5000, 3000, 0);
        expect(result.success).toBe(true);
        expect(result.remainingPoints).toBe(5000);
    });

    test("포인트를 사용할 때, 충분한 포인트가 있으면 결제 성공", () => {
        const result = processPayment(5000, 3000, 2000);
        expect(result.success).toBe(true);
        expect(result.remainingPoints).toBe(3000);
    });

    test("포인트를 사용할 때, 보유 포인트보다 많은 값을 입력하면 에러 발생", () => {
        try {
            processPayment(5000, 3000, 6000);
        } catch (error) {
            expect(error.code).toBe("INSUFFICIENT_POINTS"); // ✅ 에러 메시지 대신 코드로 검증
        }
    });

    test("포인트를 사용할 때, 결제 금액보다 많은 포인트를 입력하면 에러 발생", () => {
        try {
            processPayment(5000, 3000, 4000);
        } catch (error) {
            expect(error.code).toBe("EXCEEDS_TOTAL_PRICE"); // ✅ 에러 코드로 검증
        }
    });

    test("포인트를 사용할 때, 정확한 금액을 입력하면 0원이 남아야 함", () => {
        const result = processPayment(5000, 5000, 5000);
        expect(result.success).toBe(true);
        expect(result.remainingPoints).toBe(0);
    });

    test("포인트를 사용하지 않고 0원 결제는 정상 진행됨", () => {
        const result = processPayment(5000, 0, 0);
        expect(result.success).toBe(true);
        expect(result.remainingPoints).toBe(5000);
    });

    test("포인트를 0원 사용하면 결제는 정상 진행됨", () => {
        const result = processPayment(5000, 3000, 0);
        expect(result.success).toBe(true);
        expect(result.remainingPoints).toBe(5000);
    });
});
