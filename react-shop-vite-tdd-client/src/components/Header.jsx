import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation } from "react-router-dom";
import { useWishlist } from "../contexts/WishlistContext";
import { OrderContext } from '../contexts/OrderContext';

function Header() {
  const { wishlist } = useWishlist();
  const location = useLocation();
  const [{ userPoints }] = useContext(OrderContext);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  return (
    <header className="bg-light py-3 shadow-sm">
      <div className="container">
        <nav className="d-flex justify-content-between align-items-center">
          <Link 
            to="/" 
            className="text-decoration-none"
            style={{ color: "inherit" }}
          >
            <h1 className="h4 mb-0">여행 상품점</h1>
          </Link>

          <div className="d-flex gap-4">
            <Link 
              to="/" 
              className={`text-decoration-none ${location.pathname === '/' ? 'fw-bold' : ''}`}
              style={{ color: "inherit" }}
            >
              상품 주문
            </Link>

            <Link 
              to="/wishlist" 
              className={`text-decoration-none position-relative ${location.pathname === '/wishlist' ? 'fw-bold' : ''}`}
              style={{ color: "inherit" }}
            >
              위시리스트
              {wishlist.length > 0 && (
                <span 
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  style={{ fontSize: "0.7rem" }}
                >
                  {wishlist.length}
                  <span className="visually-hidden">위시리스트 개수</span>
                </span>
              )}
            </Link>
          </div>

          {user && (
            <div className="d-flex align-items-center">
              <span className="me-3">
                <strong>{user.username}</strong>님
              </span>
              <span className="me-3">
                포인트: <strong>{userPoints?.toLocaleString()}</strong>P
              </span>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;