import axios from "axios";
import { useEffect, useContext, useState } from "react";
import ErrorBanner from "../../components/ErrorBanner";
import { OrderContext } from "../../contexts/OrderContext";

function CompletePage({ setStep }) {
    const [{ userPoints }, , resetOrderDatas, , getOrderData] = useContext(OrderContext);
    const [orderHistory, setOrderHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        // ✅ JSON 변환된 주문 데이터를 사용
        const orderData = getOrderData();
        orderCompleted(orderData);
    }, []);

    const orderCompleted = async (orderData) => {
        try {
            let response = await axios.post("http://localhost:5003/order", orderData);
            setOrderHistory(response.data);
            setLoading(false);
        } catch (error) {
            setError(true);
        }
    };

    // ✅ 주문 내역 초기화 함수 추가
    const clearOrderHistory = async () => {
        try {
            await axios.delete("http://localhost:5003/order-history");
            setOrderHistory([]); // ✅ 프론트에서도 주문 내역 초기화
            console.log("✅ 주문 내역 초기화 완료");
        } catch (error) {
            console.error("🚨 주문 내역 초기화 실패", error);
        }
    };

    const handleClick = () => {
        resetOrderDatas();
        setOrderHistory([]); // ✅ 주문 내역 초기화
        setStep(0);
    };

    if (error) {
        return <ErrorBanner message="에러가 발생했습니다." />;
    }

    const orderTable = orderHistory.map((item) => (
        <tr key={item.orderNumber}>
            <td>{item.orderNumber}</td>
            <td>{item.price}</td>
        </tr>
    ));

    if (loading) {
        return <div>loading</div>;
    } else {
        return (
            <div style={{ textAlign: "center" }}>
                <h2>주문이 성공했습니다.</h2>
                <h3>남은 포인트: {userPoints !== undefined ? userPoints : 0}원</h3> {/* ✅ NaN 방지 */}
                <h3>지금까지 모든 주문</h3>
                <table style={{ margin: "auto" }}>
                    <tbody>
                    <tr>
                        <th>주문 번호</th>
                        <th>주문 가격</th>
                    </tr>
                    {orderTable}
                    </tbody>
                </table>
                <button onClick={handleClick}>첫페이지로</button>
                <br /><br />
                <button onClick={clearOrderHistory} style={{ backgroundColor: "red", color: "white" }}>
                    주문 내역 초기화
                </button> {/* ✅ 주문 내역 초기화 버튼 추가 */}
            </div>
        );
    }
}

export default CompletePage;
