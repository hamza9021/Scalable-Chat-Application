import { useState } from "react";
import { chatContext } from "./context/ChatContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MainPanel } from "./Pages";

const App = () => {
    const api = import.meta.env.VITE_API_URL;
    const [store, setStore] = useState();
    const [showSearchResult, setShowSearchResult] = useState(false);
    const updateStore = (data) => {
        setStore(data);
    };

    

    return (
        <div>
            <chatContext.Provider
                value={{ api, store, updateStore, showSearchResult }}
            >
                <Router>
                    <Routes>
                        <Route path="/" element={<MainPanel />} />
                    </Routes>
                </Router>
            </chatContext.Provider>
        </div>
    );
};
export default App;
