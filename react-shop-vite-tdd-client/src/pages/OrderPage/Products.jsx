import React from "react";
import { useWishlist } from "../../contexts/WishlistContext";

function Products({ name, imagePath, updateItemCount }) {
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
      <form style={{ marginTop: "10px" }}>
        <label htmlFor={name} style={{ textAlign: "right" }}>
          {name}
        </label>
        <input
          id={name}
          style={{ marginLeft: 7 }}
          type="number"
          className="form-number"
          name="quantity"
          min="0"
          defaultValue={0}
          onChange={handleChange}
        />
      </form>
    </div>
  );
}

export default Products;
