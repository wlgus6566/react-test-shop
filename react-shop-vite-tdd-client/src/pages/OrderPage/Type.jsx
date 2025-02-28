import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import Products from "./Products";
import Options from "./Options";
import ErrorBanner from "../../components/ErrorBanner";
import { OrderContext } from "../../contexts/OrderContext";

function Type({ orderType }) {
    const [items, setItems] = useState([]);
    const [error, setError] = useState(false);
    const [{ totals }, updateItemCount] = useContext(OrderContext);

    useEffect(() => {
        loadItems(orderType);
    }, [orderType]);

    const loadItems = async () => {
        try {
            let response = await axios.get(`http://localhost:5003/${orderType}`);
            setItems(response.data);
        } catch (error) {
            setError(true);
        }
    };

    if (error) {
        return <ErrorBanner message="에러가 발생했습니다." />;
    }

    const ItemComponent = orderType === "products" ? Products : Options;
    const orderTypeKorean = orderType === "products" ? "상품" : "옵션";

    return (
        <div className="card p-3 shadow-sm">
            <h2 className="text-center text-primary">{orderTypeKorean} 선택</h2>
            <p className="text-center">개별 가격</p>
            <h4 className="text-center fw-bold text-danger">
                {orderType === "products"
                    ? `총 상품 가격: ${(totals[orderType] || 0).toLocaleString()}원`
                    : `총 옵션 가격: ${(totals[orderType] || 0).toLocaleString()}원`}
            </h4>
            <div className="row mt-3">
                {items.map((item) => (
                    <div className="col-md-6" key={item.name}>
                        <ItemComponent
                            name={item.name}
                            imagePath={item.imagePath}
                            updateItemCount={(name, count) => updateItemCount(name, count, orderType)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Type;
