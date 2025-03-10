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
    <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: "15px", overflow: "hidden" }}>
      <div style={{ position: "relative" }}>
        <button
          onClick={handleWishClick}
          className="wish-button position-absolute"
          style={{
            right: "15px",
            top: "15px",
            background: "rgba(255, 255, 255, 0.9)",
            border: "none",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            fontSize: "1.2rem",
            cursor: "pointer",
            zIndex: 1,
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.2s ease"
          }}
          aria-label={isInWishlist(name) ? "찜하기 취소" : "찜하기"}
        >
          {isInWishlist(name) ? "❤️" : "🤍"}
        </button>
        <div style={{ 
          background: "#f8f9fa",
          position: "relative",
          width: "100%",
          paddingTop: "58%",
          overflow: "hidden"
        }}>
          <img
            style={{ 
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              transition: "transform 0.3s ease"
            }}
            src={`http://localhost:5003/${imagePath}`}
            alt={`${name} product`}
          />
        </div>
      </div>
      <div className="card-body d-flex flex-column align-items-center" style={{ padding: "1rem 0.5rem 0.5rem" }}>
        <h5 className="card-title mb-2 fw-bold">{name}</h5>
        <p className="text-primary fw-bold" style={{ fontSize: "1.1rem", marginBottom: "0" }}>
          {price.toLocaleString()}원
        </p>
        <div className="w-100">
          <label htmlFor={name} className="form-label text-muted mb-2 w-100 text-center">
          </label>
          <div className="d-flex justify-content-center">
            <input
              id={name}
              type="number"
              className="form-control text-center"
              style={{
                width: "120px",
                borderRadius: "8px",
                padding: "8px",
                border: "1px solid #dee2e6"
              }}
              name="quantity"
              min="0"
              defaultValue={0}
              onChange={handleChange}
              aria-label={`${name} 수량`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Products;
