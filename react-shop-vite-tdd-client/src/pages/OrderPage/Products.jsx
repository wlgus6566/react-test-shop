import React from "react";
import { useWishlist } from "../../contexts/WishlistContext";

function Products({ name, imagePath, price = 0, updateItemCount }) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  
  const handleChange = (event) => {
    const currentValue = event.target.value;
    updateItemCount(name, currentValue);
  };

  const handleWishClick = (e) => {
    e.preventDefault();
    if (isInWishlist(name)) {
      removeFromWishlist(name);
    } else {
      addToWishlist({ name, imagePath });
    }
  };

  return (
    <div style={{ textAlign: "center", position: "relative" }}>
      <button
        onClick={handleWishClick}
        className="wish-button"
        style={{
          position: "absolute",
          right: "15%",
          top: "10px",
          background: "none",
          border: "none",
          fontSize: "1.5rem",
          cursor: "pointer",
          zIndex: 1
        }}
        aria-label={isInWishlist(name) ? "찜하기 취소" : "찜하기"}
      >
        {isInWishlist(name) ? "❤️" : "🤍"}
      </button>
      <img
        style={{ width: "75%" }}
        src={`http://localhost:5003/${imagePath}`}
        alt={`${name} product`}
      />
      <div className="mt-3 d-flex flex-column align-items-center">
        <h5 className="mb-1">{name}</h5>
        <p className="text-primary mb-2">{price.toLocaleString()}원</p>
        <div className="mt-1">
          <label htmlFor={name} className="form-label">
            {name} 수량
          </label>
          <input
            id={name}
            type="number"
            className="form-control"
            style={{ width: "100px" }}
            name="quantity"
            min="0"
            defaultValue={0}
            onChange={handleChange}
            aria-label={`${name} 수량`}
          />
        </div>
      </div>
    </div>
  );
}

export default Products;
