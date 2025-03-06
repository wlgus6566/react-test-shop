import { useState } from "react";
import OrderPage from "./pages/OrderPage/OrderPage";
import SummaryPage from "./pages/SummaryPage/SummaryPage";
import CompletePage from "./pages/CompletePage/CompletePage";
import { OrderContextProvider } from "./contexts/OrderContext";
import "bootstrap/dist/css/bootstrap.min.css";
function App() {
    const [step, setStep] = useState(0);

    return (
        <OrderContextProvider>
            <div className="container mt-5">
                <div className="card p-4 shadow-lg">

                    
                    {step === 0 && <OrderPage setStep={setStep} />}
                    {step === 1 && <SummaryPage setStep={setStep} />}
                    {step === 2 && <CompletePage setStep={setStep} />}
                </div>
            </div>
        </OrderContextProvider>
    );
}

export default App;
