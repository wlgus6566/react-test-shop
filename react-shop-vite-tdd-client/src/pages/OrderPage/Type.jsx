import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import Products from "./Products";
import Options from "./Options";
import PriceFilter from "./PriceFilter";
import ErrorBanner from "../../components/ErrorBanner";
import { OrderContext } from "../../contexts/OrderContext";
import "./style/OrderPage.css";

function Type({ orderType }) {
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [priceFilter, setPriceFilter] = useState(0);
    const [error, setError] = useState(false);
    const [{ totals }, updateItemCount] = useContext(OrderContext);

    useEffect(() => {
        loadItems(orderType);
    }, [orderType]);

    useEffect(() => {
        if (priceFilter === 0) {
            setFilteredItems(items);
        } else {
            setFilteredItems(items.filter(item => item.price <= priceFilter));
        }
    }, [items, priceFilter]);

    const loadItems = async () => {
        try {
            let response = await axios.get(`http://localhost:5003/${orderType}`);
            const data = response.data[orderType] || response.data;
            const itemsArray = Array.isArray(data) ? data : [];
            setItems(itemsArray);
            setFilteredItems(itemsArray);
        } catch (error) {
            setError(true);
        }
    };

    const handleFilterChange = (price) => {
        setPriceFilter(price);
    };

    if (error) {
        return <ErrorBanner message="에러가 발생했습니다." />;
    }

    const ItemComponent = orderType === "products" ? Products : Options;
    const orderTypeKorean = orderType === "products" ? "상품" : "옵션";
    
    const totalPrice = totals[orderType] || 0;
    const formattedPrice = isNaN(totalPrice) ? 0 : totalPrice;

    return (
        <div className="card p-3 shadow-sm">
            <h2 className="text-center text-primary">{orderTypeKorean} 선택</h2>    
            <h4 className="text-center fw-bold text-danger">
                {orderType === "products"
                    ? `총 상품 가격: ${formattedPrice.toLocaleString()}원`
                    : `총 옵션 가격: ${formattedPrice.toLocaleString()}원`}
            </h4>
            <PriceFilter onFilterChange={handleFilterChange} maxPrice={2000} />
            {(!filteredItems || filteredItems.length === 0) ? (
                <p className="text-center">데이터가 없습니다</p>
            ) : (
                <div className="row mt-3 type">
                    {filteredItems.map((item) => (
                        <div className="col-md-6" key={item.name}>
                            <ItemComponent
                                name={item.name}
                                imagePath={item.imagePath}
                                price={item.price}
                                updateItemCount={(name, count) => updateItemCount(name, count, orderType)}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Type;