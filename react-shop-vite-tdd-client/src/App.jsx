import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import OrderPage from "./pages/OrderPage/OrderPage";
import CompletePage from "./pages/CompletePage/CompletePage";
import SummaryPage from "./pages/SummaryPage/SummaryPage";
import WishlistPage from "./pages/WishlistPage/WishlistPage";
import { WishlistProvider } from "./contexts/WishlistContext";
import { OrderContextProvider } from "./contexts/OrderContext";
import Header from "./components/Header";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
    const [step, setStep] = useState(0);

    return (
        <div className="App">
            <WishlistProvider>
                <OrderContextProvider>
                    <Router>
                        <Header />
                        <div
                            style={{
                                marginTop: "50px",
                                marginLeft: "auto",
                                marginRight: "auto",
                                width: "80%",
                            }}
                        >
                            <Routes>
                                <Route
                                    path="/"
                                    element={
                                        <div className="card p-4 shadow-lg">
                                            {step === 0 && <OrderPage setStep={setStep} />}
                                            {step === 1 && <SummaryPage setStep={setStep} />}
                                            {step === 2 && <CompletePage setStep={setStep} />}
                                        </div>
                                    }
                                />
                                <Route path="/wishlist" element={<WishlistPage />} />
                            </Routes>
                        </div>
                    </Router>
                </OrderContextProvider>
            </WishlistProvider>
        </div>
    );
}

export default App;
