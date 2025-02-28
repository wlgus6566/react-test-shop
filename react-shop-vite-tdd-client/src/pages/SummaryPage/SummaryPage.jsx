import { useState, useContext } from "react";
import axios from "axios";
import { OrderContext } from "../../contexts/OrderContext";
import { processPayment } from "../../utils/processPayment";

const SummaryPage = ({ setStep }) => {
    const [{ totals, userPoints }, , , deductPoints, getOrderData] = useContext(OrderContext);
    const [checked, setChecked] = useState(false);
    const [usePoints, setUsePoints] = useState(false);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false); // 중복 요청 방지 상태 추가

    const totalPrice = totals.total;

    const handleSubmit = async (event) => {
        event.preventDefault(); // ✅ 폼 기본 동작 방지

        if (isSubmitting) return; // 이미 결제가 진행 중이면 중복 요청 방지
        setIsSubmitting(true); // ✅ 이걸 가장 먼저 실행하여 중복 요청 방지

        try {
            // 결제 처리
            processPayment(userPoints, totalPrice, usePoints);
            deductPoints(totalPrice);

            // 주문 데이터를 JSON 형식으로 변환하여 서버로 전송
            const orderData = getOrderData();

            console.log("📌 전송할 데이터:", JSON.stringify(orderData, null, 2));

            // 주문 데이터를 서버로 전송
            const response = await axios.post("http://localhost:5003/order", orderData);

            console.log("✅ 주문 완료:", response.data);

            // 결제 성공 시 다음 단계로 이동
            setStep(2);
        } catch (e) {
            setError(e.message);
        } finally {
            setTimeout(() => setIsSubmitting(false), 1000); // ✅ 상태 초기화 지연 처리
        }
    };

    return (
        <div className="container text-center">
            <div className="card p-4 shadow-lg">
                <h1 className="mb-3 text-primary">주문 확인</h1>
                <h2 className="fw-bold text-dark">총 주문 금액: {totalPrice.toLocaleString()}원</h2>
                <h3 className="text-secondary">현재 보유 포인트: {userPoints?.toLocaleString() ?? 0}원</h3> {/* ✅ `undefined` 방지 */}

                <div className="mt-3 form-check">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        checked={usePoints}
                        onChange={(e) => setUsePoints(e.target.checked)}
                        id="usePointsCheckbox"
                    />
                    <label className="form-check-label" htmlFor="usePointsCheckbox">
                        포인트 사용하기
                    </label>
                </div>

                {error && <p className="text-danger mt-2 fw-bold">{error}</p>} {/* ✅ 에러 메시지 디자인 개선 */}

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
                        disabled={!checked || isSubmitting}
                        type="submit"
                        className={`btn btn-lg mt-3 ${isSubmitting ? "btn-secondary" : "btn-success"}`}
                    >
                        결제하기
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SummaryPage;
