import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import OrderPage from "./pages/OrderPage/OrderPage";
import CompletePage from "./pages/CompletePage/CompletePage";
import SummaryPage from "./pages/SummaryPage/SummaryPage";
import WishlistPage from "./pages/WishlistPage/WishlistPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import { WishlistProvider } from "./contexts/WishlistContext";
import { OrderContextProvider } from "./contexts/OrderContext";
import Header from "./components/Header";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
    const [step, setStep] = useState(0);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
    }, []);

    // 인증이 필요한 라우트를 위한 래퍼 컴포넌트
    const PrivateRoute = ({ children }) => {
        return isAuthenticated ? children : <Navigate to="/login" />;
    };

    return (
        <div className="App">
            <WishlistProvider>
                <OrderContextProvider>
                    <Router>
                        {isAuthenticated && <Header />}
                        <div
                            style={{
                                marginTop: isAuthenticated ? "50px" : "0",
                                marginLeft: "auto",
                                marginRight: "auto",
                                width: "80%",
                            }}
                        >
                            <Routes>
                                <Route path="/login" element={
                                    isAuthenticated ? <Navigate to="/" /> : <LoginPage setIsAuthenticated={setIsAuthenticated} />
                                } />
                                <Route path="/register" element={
                                    isAuthenticated ? <Navigate to="/" /> : <RegisterPage />
                                } />
                                <Route
                                    path="/"
                                    element={
                                        <PrivateRoute>
                                            <div className="card p-4 shadow-lg">
                                                {step === 0 && <OrderPage setStep={setStep} />}
                                                {step === 1 && <SummaryPage setStep={setStep} />}
                                                {step === 2 && <CompletePage setStep={setStep} />}
                                            </div>
                                        </PrivateRoute>
                                    }
                                />
                                <Route 
                                    path="/wishlist" 
                                    element={
                                        <PrivateRoute>
                                            <WishlistPage />
                                        </PrivateRoute>
                                    } 
                                />
                            </Routes>
                        </div>
                    </Router>
                </OrderContextProvider>
            </WishlistProvider>
        </div>
    );
}

export default App;