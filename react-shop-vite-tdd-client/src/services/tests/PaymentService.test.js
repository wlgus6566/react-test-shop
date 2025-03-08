import { paymentService } from '../PaymentService';

describe('PaymentService', () => {
    describe('processPayment', () => {
        const mockPaymentParams = {
            userPoints: 5000,
            totalPrice: 3000,
            usePoints: true,
            usedPoints: 2000
        };

        test('포인트를 사용하지 않는 경우의 결제 처리', async () => {
            const result = await paymentService.processPayment({
                ...mockPaymentParams,
                usePoints: false
            });

            expect(result).toEqual({
                success: true,
                finalPrice: 3000,
                remainingPoints: 5000,
                usedPoints: 0
            });
        });

        test('포인트를 사용하는 경우의 결제 처리', async () => {
            const result = await paymentService.processPayment(mockPaymentParams);

            expect(result).toEqual({
                success: true,
                finalPrice: 1000,
                remainingPoints: 3000,
                usedPoints: 2000
            });
        });

        test('보유 포인트보다 많은 포인트 사용 시 에러 발생', async () => {
            await expect(paymentService.processPayment({
                ...mockPaymentParams,
                usedPoints: 6000
            })).rejects.toEqual({
                code: 'INSUFFICIENT_POINTS',
                message: '보유 포인트보다 많은 금액을 사용할 수 없습니다.'
            });
        });

        test('결제 금액보다 많은 포인트 사용 시 에러 발생', async () => {
            await expect(paymentService.processPayment({
                ...mockPaymentParams,
                usedPoints: 4000
            })).rejects.toEqual({
                code: 'EXCEEDS_TOTAL_PRICE',
                message: '사용할 포인트가 결제 금액을 초과할 수 없습니다.'
            });
        });

        test('포인트를 0원 사용하는 경우', async () => {
            const result = await paymentService.processPayment({
                ...mockPaymentParams,
                usedPoints: 0
            });

            expect(result).toEqual({
                success: true,
                finalPrice: 3000,
                remainingPoints: 5000,
                usedPoints: 0
            });
        });

        test('결제 금액이 0원인 경우', async () => {
            const result = await paymentService.processPayment({
                ...mockPaymentParams,
                totalPrice: 0,
                usedPoints: 0
            });

            expect(result).toEqual({
                success: true,
                finalPrice: 0,
                remainingPoints: 5000,
                usedPoints: 0
            });
        });
    });

    describe('validatePointsInput', () => {
        const mockValidationParams = {
            userPoints: 5000,
            totalPrice: 3000,
            pointsInput: 2000
        };

        test('유효한 포인트 입력', () => {
            const result = paymentService.validatePointsInput(mockValidationParams);

            expect(result).toEqual({
                isValid: true,
                message: null
            });
        });

        test('보유 포인트보다 많은 포인트 입력', () => {
            const result = paymentService.validatePointsInput({
                ...mockValidationParams,
                pointsInput: 6000
            });

            expect(result).toEqual({
                isValid: false,
                message: '보유 포인트보다 많은 금액을 사용할 수 없습니다.'
            });
        });

        test('결제 금액보다 많은 포인트 입력', () => {
            const result = paymentService.validatePointsInput({
                ...mockValidationParams,
                pointsInput: 4000
            });

            expect(result).toEqual({
                isValid: false,
                message: '사용할 포인트가 결제 금액을 초과할 수 없습니다.'
            });
        });
    });
}); 