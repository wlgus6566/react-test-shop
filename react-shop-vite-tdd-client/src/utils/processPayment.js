export function processPayment(userPoints, totalPrice, usePoints = false) {
    if (usePoints) {
        if (userPoints < totalPrice) {
            throw new Error("포인트가 부족합니다.");
        }
        return { remainingPoints: userPoints - totalPrice, success: true };
    } else {
        return { remainingPoints: userPoints, success: true };
    }
}