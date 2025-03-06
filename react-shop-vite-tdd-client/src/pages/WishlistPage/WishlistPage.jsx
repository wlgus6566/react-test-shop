import React from "react";
import { useWishlist } from "../../contexts/WishlistContext";
import { useNavigate } from "react-router-dom";

function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">나의 위시리스트</h2>
      {wishlist.length === 0 ? (
        <div className="text-center">
          <p>위시리스트가 비어있습니다.</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate("/order")}
          >
            상품 둘러보기
          </button>
        </div>
      ) : (
        <div className="row">
          {wishlist.map((product) => (
            <div key={product.name} className="col-md-4 mb-4">
              <div className="card">
                <img
                  src={`http://localhost:5003/${product.imagePath}`}
                  className="card-img-top"
                  alt={product.name}
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <div className="card-body">
                  <h5 className="card-title">{product.name}</h5>
                  <div className="d-flex justify-content-between">
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => removeFromWishlist(product.name)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WishlistPage;