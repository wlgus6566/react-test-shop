import { paymentService } from '../PaymentService';

describe('PaymentService', () => {
    describe('validatePayment', () => {
        test('포인트가 충분하지 않을 때 에러 발생', () => {
            expect(() => {
                paymentService.validatePayment({
                    userPoints: 1000,
                    totalPrice: 500,
                    usedPoints: 1500
                });
            }).toThrowError("보유 포인트보다 많은 금액을 사용할 수 없습니다.");
        });

        test('사용할 포인트가 결제 금액을 초과할 때 에러 발생', () => {
            expect(() => {
                paymentService.validatePayment({
                    userPoints: 2000,
                    totalPrice: 1000,
                    usedPoints: 1500
                });
            }).toThrowError("사용할 포인트가 결제 금액을 초과할 수 없습니다.");
        });

        test('유효한 포인트 사용 시 결제 세부 정보 반환', () => {
            const result = paymentService.validatePayment({
                userPoints: 5000,
                totalPrice: 3000,
                usedPoints: 2000
            });

            expect(result).toEqual({
                finalPrice: 1000,
                remainingPoints: 3000,
                usedPoints: 2000
            });
        });
    });

    describe('processPayment', () => {
        test('포인트를 사용하지 않는 경우 결제 성공', async () => {
            const result = await paymentService.processPayment({
                userPoints: 5000,
                totalPrice: 3000,
                usePoints: false,
                usedPoints: 0
            });

            expect(result).toEqual({
                success: true,
                finalPrice: 3000,
                remainingPoints: 5000,
                usedPoints: 0
            });
        });

        test('포인트를 사용하는 경우 결제 성공', async () => {
            const result = await paymentService.processPayment({
                userPoints: 5000,
                totalPrice: 3000,
                usePoints: true,
                usedPoints: 2000
            });

            expect(result).toEqual({
                success: true,
                finalPrice: 1000,
                remainingPoints: 3000,
                usedPoints: 2000
            });
        });
    });

    describe('validatePointsInput', () => {
        test('보유 포인트보다 많은 포인트 입력 시 유효성 검사 실패', () => {
            const result = paymentService.validatePointsInput({
                userPoints: 1000,
                totalPrice: 500,
                pointsInput: 1500
            });

            expect(result).toEqual({
                isValid: false,
                message: "보유 포인트보다 많은 금액을 사용할 수 없습니다."
            });
        });

        test('결제 금액보다 많은 포인트 입력 시 유효성 검사 실패', () => {
            const result = paymentService.validatePointsInput({
                userPoints: 2000,
                totalPrice: 1000,
                pointsInput: 1500
            });

            expect(result).toEqual({
                isValid: false,
                message: "사용할 포인트가 결제 금액을 초과할 수 없습니다."
            });
        });

        test('유효한 포인트 입력 시 유효성 검사 성공', () => {
            const result = paymentService.validatePointsInput({
                userPoints: 5000,
                totalPrice: 3000,
                pointsInput: 2000
            });

            expect(result).toEqual({
                isValid: true,
                message: null
            });
        });
    });
}); 