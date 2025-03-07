export function processPayment(userPoints, totalPrice, usedPoints = 0) {
    if (usedPoints > userPoints) {
        const error = new Error("보유 포인트보다 많은 금액을 사용할 수 없습니다.");
        error.code = "INSUFFICIENT_POINTS"; 
        throw error;
    }
    if (usedPoints > totalPrice) {
        const error = new Error("사용할 포인트가 결제 금액을 초과할 수 없습니다.");
        error.code = "EXCEEDS_TOTAL_PRICE"; 
        throw error;
    }
    return { remainingPoints: userPoints - usedPoints, success: true };
}
