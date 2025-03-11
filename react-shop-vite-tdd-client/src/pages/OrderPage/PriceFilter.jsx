import React from 'react';

const PriceFilter = ({ onFilterChange, maxPrice = 2000 }) => {
    const priceRanges = [];
    for (let i = 500; i <= maxPrice; i += 500) {
        priceRanges.push(i);
    }

    return (
        <div className="mb-3">
            <select 
                className="form-select"
                onChange={(e) => onFilterChange(Number(e.target.value))}
                aria-label="가격 필터"
            >
                <option value="0">가격 필터</option>
                {priceRanges.map((price) => (
                    <option key={price} value={price}>
                        {price.toLocaleString()}원 이하
                    </option>
                ))}
            </select>
        </div>
    );
};

export default PriceFilter; 