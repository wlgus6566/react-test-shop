import React from "react";

function Options({ name, price, updateItemCount }) {
    return (
        <div className="form-check">
            <input
                type="checkbox"
                className="form-check-input"
                id={`${name}-option`}
                onChange={(event) => {
                    updateItemCount(name, event.target.checked ? 1 : 0);
                }}
            />
            <label className="form-check-label ms-2" htmlFor={`${name}-option`}>
                {name} 
            </label>
            <div className="ms-4 mt-1">({price.toLocaleString()}원)</div>
        </div>
    );
}

export default Options;
