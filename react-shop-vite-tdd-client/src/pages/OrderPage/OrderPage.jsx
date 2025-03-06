import React, { useContext } from "react";
import { OrderContext } from "../../contexts/OrderContext";
import Type from "./Type";

function OrderPage({ setStep }) {
    const [{ totals }] = useContext(OrderContext);

    return (
        <div>
            <h1 className="text-center mb-4">🛫 여행 상품  주문</h1>
            <div className="row">
                <div className="col-md-6">
                    <Type orderType="products" />
                </div>
                <div className="col-md-6">
                    <Type orderType="options" />
                </div>
            </div>
            <div className="text-center mt-4">
                <h2 className="fw-bold">총 금액: {totals.total.toLocaleString()}원</h2>
                <button className="btn btn-primary btn-lg mt-3" onClick={() => setStep(1)}>
                    주문하기
                </button>
            </div>
        </div>
    );
}

export default OrderPage;
