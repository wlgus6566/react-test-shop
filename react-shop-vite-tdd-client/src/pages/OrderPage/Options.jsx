import React from "react";

function Options({ name, price = 0, updateItemCount }) {
    return (
        <div className="form-check mb-3">
            <div>
                <input
                    type="checkbox"
                    className="form-check-input"
                    id={`${name}-option`}
                    onChange={(event) => {
                        updateItemCount(name, event.target.checked ? 1 : 0);
                    }}
                    aria-label={name}
                />
                <label className="form-check-label ms-2" htmlFor={`${name}-option`}>
                    {name}
                </label>
                <div className="ms-4 mt-1">
                    <span className="text-primary">
                        {price.toLocaleString()}원
                    </span>
                </div>
            </div>
        </div>
    );
}

export default Options;
