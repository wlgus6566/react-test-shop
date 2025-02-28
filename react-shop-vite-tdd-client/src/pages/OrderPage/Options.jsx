import React from "react";

function Options({ name, updateItemCount }) {
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
        </div>
    );
}

export default Options;
