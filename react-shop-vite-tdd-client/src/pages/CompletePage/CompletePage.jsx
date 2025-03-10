import { useEffect, useContext, useState } from "react";
import { orderApi } from "../../api/orderApi";
import ErrorBanner from "../../components/ErrorBanner";
import { OrderContext } from "../../contexts/OrderContext";

function CompletePage({ setStep }) {
    const [{ userPoints }, , resetOrderDatas] = useContext(OrderContext);
    const [orderHistory, setOrderHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetchOrderHistory();
    }, []);

    const fetchOrderHistory = async () => {
        try {
            const data = await orderApi.getOrderHistory();
            setOrderHistory(data);
            setLoading(false);
        } catch (error) {
            setError(true);
        }
    };

    const clearOrderHistory = async () => {
        try {
            await orderApi.clearOrderHistory();
            setOrderHistory([]); 
            console.log(" 주문 내역 초기화 완료");
        } catch (error) {
            console.error(" 주문 내역 초기화 실패", error);
        }
    };

    const handleClick = () => {
        resetOrderDatas();
        setOrderHistory([]); // 주문 내역 초기화
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
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
                <div className="spinner-border text-primary me-2" role="status" />
                <span className="h5 mb-0">Loading...</span>
            </div>
        );
    } else {
        return (
            <div className="container py-5">
                <div className="card shadow-sm">
                    <div className="card-body">
                        <div className="text-center mb-4">
                            <div className="display-1 text-success mb-3">✓</div>
                            <h2 className="card-title mb-3">주문이 성공했습니다!</h2>
                            <div className="alert alert-info">
                                <h5 className="mb-0">
                                    남은 포인트: <strong>{userPoints !== undefined ? userPoints.toLocaleString() : 0}원</strong>
                                </h5>
                            </div>
                        </div>

                        <div className="mb-4">
                            <h3 className="text-center mb-3">지금까지의 주문 내역</h3>
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead className="table-light">
                                        <tr>
                                            <th scope="col">주문 번호</th>
                                            <th scope="col">주문 금액</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orderTable}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="d-flex justify-content-center gap-3">
                            <button 
                                className="btn btn-primary"
                                onClick={handleClick}
                            >
                                첫페이지로
                            </button>
                            <button 
                                className="btn btn-danger"
                                onClick={clearOrderHistory}
                            >
                                주문 내역 초기화
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default CompletePage;
