/**
 * 결제 처리를 위한 유효성 검사 및 계산을 수행합니다.
 */
export const validatePayment = ({ userPoints, totalPrice, usedPoints }) => {
    if (usedPoints > userPoints) {
        throw {
            code: "INSUFFICIENT_POINTS",
            message: "보유 포인트보다 많은 금액을 사용할 수 없습니다."
        };
    }
    
    if (usedPoints > totalPrice) {
        throw {
            code: "EXCEEDS_TOTAL_PRICE",
            message: "사용할 포인트가 결제 금액을 초과할 수 없습니다."
        };
    }

    return {
        finalPrice: totalPrice - usedPoints,
        remainingPoints: userPoints - usedPoints,
        usedPoints
    };
};

/**
 * 실제 결제를 처리합니다.
 */
export const processPayment = async ({ userPoints, totalPrice, usePoints, usedPoints }) => {
    // 포인트를 사용하지 않는 경우
    if (!usePoints || usedPoints === 0) {
        return {
            success: true,
            finalPrice: totalPrice,
            remainingPoints: userPoints,
            usedPoints: 0
        };
    }

    // 결제 유효성 검사 및 계산
    const paymentDetails = validatePayment({
        userPoints,
        totalPrice,
        usedPoints
    });

    return {
        success: true,
        ...paymentDetails
    };
};

/**
 * 입력된 포인트 값의 유효성을 실시간으로 검사합니다.
 */
export const validatePointsInput = ({ userPoints, totalPrice, pointsInput }) => {
    if (pointsInput > userPoints) {
        return {
            isValid: false,
            message: "보유 포인트보다 많은 금액을 사용할 수 없습니다."
        };
    }
    
    if (pointsInput > totalPrice) {
        return {
            isValid: false,
            message: "사용할 포인트가 결제 금액을 초과할 수 없습니다."
        };
    }

    return {
        isValid: true,
        message: null
    };
}; 