import { useState, useContext } from "react";
import { OrderContext } from "../../contexts/OrderContext";
import { orderApi } from "../../api/orderApi";
import { validatePointsInput, processPayment } from "../../services/PaymentService";
import "./style/SummaryPage.css";

const SummaryPage = ({ setStep }) => {
    const [{ totals, userPoints, products, options }, , , deductPoints, getOrderData] = useContext(OrderContext);
    const [checked, setChecked] = useState(false);
    const [usePoints, setUsePoints] = useState(false);
    const [usedPoints, setUsedPoints] = useState(0);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const totalPrice = totals.total;

    // 선택한 상품 목록 생성
    const productList = Array.from(products.entries())
        .filter(([_, count]) => count > 0)
        .map(([name, count]) => `${count} ${name}`)
        .join(", ");

    // 선택한 옵션 목록 생성
    const optionList = Array.from(options.entries())
        .filter(([_, count]) => count > 0)
        .map(([name]) => name)
        .join(", ");

    // ✅ 포인트 입력 시 실시간 유효성 검사
    const handlePointsChange = (event) => {
        const pointsInput = parseInt(event.target.value, 10) || 0;
        const { isValid, message } = validatePointsInput({
            userPoints,
            totalPrice,
            pointsInput: pointsInput
        });

        setError(message);
        setUsedPoints(pointsInput);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (isSubmitting || error) return;
        setIsSubmitting(true);

        try {
            // ✅ 결제 처리
            const paymentResult = await processPayment({
                userPoints,
                totalPrice,
                usePoints,
                usedPoints: usedPoints
            });

            if (paymentResult.success) {
                deductPoints(paymentResult.usedPoints);
                const orderData = {
                    ...getOrderData(),
                    payment: paymentResult
                };

                const response = await orderApi.createOrder(orderData);
                console.log("✅ 주문 완료:", response);
                setStep(2);
            }
        } catch (e) {
            console.error("주문 에러:", e);
            setError(e.message || "주문 처리 중 오류가 발생했습니다.");
        } finally {
            setTimeout(() => setIsSubmitting(false), 1000);
        }
    };

    return (
        <div className="summary-container">
            <h1 className="summary-title">주문 확인</h1>
            <h2 className="summary-total">총 주문 금액: {totalPrice.toLocaleString()}원</h2>
            <h3 className="summary-points">현재 보유 포인트: {userPoints?.toLocaleString() ?? 0}원</h3>

            {/* 선택한 상품과 옵션 목록 */}
            <div className="selected-items mt-4">
                <div className="card mb-3">
                    <div className="card-body">
                        <h4 className="card-title">선택한 항목</h4>
                        <div className="selected-items-list" data-testid="selected-items">
                            <div>{productList}</div>
                            <div>{optionList}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="checkbox-container">
                <input
                    type="checkbox"
                    className="form-check-input"
                    checked={usePoints}
                    onChange={(e) => {
                        setUsePoints(e.target.checked);
                        if (!e.target.checked) {
                            setUsedPoints(0);
                            setError(null);
                        }
                    }}
                    id="usePointsCheckbox"
                />
                <label htmlFor="usePointsCheckbox">포인트 사용하기</label>
            </div>

            {usePoints && (
                <div className="mt-2">
                    <label htmlFor="usedPointsInput" className="form-label fw-bold">사용할 포인트:</label>
                    <input
                        type="number"
                        id="usedPointsInput"
                        className="point-input"
                        value={usedPoints}
                        onChange={handlePointsChange}
                        min="0"
                        max={userPoints}
                    />
                    <p className="text-muted">사용 가능 포인트: {userPoints.toLocaleString()}원</p>
                    {error && <p className="error-message">{error}</p>}
                </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4">
                <div className="checkbox-container">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        checked={checked}
                        onChange={(e) => setChecked(e.target.checked)}
                        id="confirmCheckbox"
                    />
                    <label htmlFor="confirmCheckbox">주문을 확인하셨나요?</label>
                </div>

                <button
                    disabled={!checked || !!error}
                    type="submit"
                    className="submit-button mt-3"
                >
                    {isSubmitting ? "결제 중..." : "결제하기"}
                </button>
            </form>
        </div>
    );
};

export default SummaryPage; 