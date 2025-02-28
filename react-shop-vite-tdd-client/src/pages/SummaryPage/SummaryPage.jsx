import { useState, useContext } from "react";
import axios from "axios";
import { OrderContext } from "../../contexts/OrderContext";
import { processPayment } from "../../utils/processPayment";

const SummaryPage = ({ setStep }) => {
    const [{ totals, userPoints }, , , deductPoints, getOrderData] = useContext(OrderContext);
    const [checked, setChecked] = useState(false);
    const [usePoints, setUsePoints] = useState(false);
    const [usedPoints, setUsedPoints] = useState(0);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const totalPrice = totals.total;

    // ✅ 포인트 입력 시 실시간 유효성 검사
    const handlePointsChange = (event) => {
        let value = parseInt(event.target.value, 10) || 0;

        if (value > userPoints) {
            setError("보유 포인트보다 많은 금액을 사용할 수 없습니다.");
        } else if (value > totalPrice) {
            setError("사용할 포인트가 결제 금액을 초과할 수 없습니다.");
        } else {
            setError(null); // 올바른 값 입력 시 에러 제거
        }

        setUsedPoints(value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (isSubmitting || error) return; // ✅ 에러가 있으면 결제 불가
        setIsSubmitting(true);

        try {
            processPayment(userPoints, totalPrice, usePoints ? usedPoints : 0);
            deductPoints(usedPoints);

            const orderData = getOrderData();
            console.log("📌 전송할 데이터:", JSON.stringify(orderData, null, 2));

            const response = await axios.post("http://localhost:5003/order", orderData);
            console.log("✅ 주문 완료:", response.data);

            setStep(2);
        } catch (e) {
            setError(e.message);
        } finally {
            setTimeout(() => setIsSubmitting(false), 1000);
        }
    };

    return (
        <div className="container text-center">
            <div className="card p-4 shadow-lg">
                <h1 className="mb-3 text-primary">주문 확인</h1>
                <h2 className="fw-bold text-dark">총 주문 금액: {totalPrice.toLocaleString()}원</h2>
                <h3 className="text-secondary">현재 보유 포인트: {userPoints?.toLocaleString() ?? 0}원</h3>

                {/* ✅ 포인트 사용 체크박스 */}
                <div className="mt-3 form-check">
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
                    <label className="form-check-label" htmlFor="usePointsCheckbox">
                        포인트 사용하기
                    </label>
                </div>

                {/* ✅ 포인트 입력 UI (체크 시 활성화) */}
                {usePoints && (
                    <div className="mt-2">
                        <label htmlFor="usedPointsInput" className="form-label fw-bold">
                            사용할 포인트:
                        </label>
                        <input
                            type="number"
                            id="usedPointsInput"
                            className="form-control text-center"
                            value={usedPoints}
                            onChange={handlePointsChange}
                            min="0"
                            max={userPoints}
                        />
                        <p className="text-muted">
                            사용 가능 포인트: {userPoints.toLocaleString()}원
                        </p>
                        {/* ✅ 실시간 에러 메시지 */}
                        {error && <p className="text-danger fw-bold mt-1">{error}</p>}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-4">
                    <div className="form-check d-flex justify-content-center">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            checked={checked}
                            onChange={(e) => setChecked(e.target.checked)}
                            id="confirmCheckbox"
                        />
                        <label className="form-check-label ms-2" htmlFor="confirmCheckbox">
                            주문을 확인하셨나요?
                        </label>
                    </div>

                    <button
                        disabled={!checked || isSubmitting || !!error} // 에러 발생 시 결제 버튼 비활성화
                        type="submit"
                        className={`btn btn-lg mt-3 ${isSubmitting ? "btn-secondary" : "btn-success"}`}
                    >
                        {isSubmitting ? "결제 중..." : "결제하기"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SummaryPage;
