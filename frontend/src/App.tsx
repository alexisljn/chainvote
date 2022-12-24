import React, {createContext, useCallback, useEffect, useState} from 'react';
import Header from "./components/header/Header";
import {Route, Routes} from "react-router-dom";
import Home from "./components/pages/Home";
import Error from "./components/pages/Error";
import History from "./components/pages/History";
import Admin from "./components/pages/Admin";
import {providers} from "ethers";
import {
    cleanProviderEvents,
    listenProviderEvents,
    PROVIDER_EVENT
} from "./events-manager/ProviderEventsManager";

function App() {

    const [provider, setProvider] = useState<providers.Web3Provider | undefined | null>(undefined);

    const [address, setAddress] = useState<string | null>(null);

    const [chainId, setChainId] = useState<number | null>(null);

    const handleLocallyProviderEvents = useCallback((e: any) => {
        switch (e.detail.type) {
            case "chainChanged":
                window.location.reload();
                break;
        }
    }, []);

    useEffect(() => {
        if (window.ethereum) {
            const web3Provider = new providers.Web3Provider(window.ethereum);

            setProvider(web3Provider);

            listenProviderEvents(window.ethereum);

            window.addEventListener(PROVIDER_EVENT, handleLocallyProviderEvents);

            return () => {
                cleanProviderEvents(window.ethereum);

                window.removeEventListener(PROVIDER_EVENT, handleLocallyProviderEvents);
            }
        } else {
            setProvider(null);
        }

    }, []);

    return (
        <div className="grid">
            <Header/>
            <div className="sidebar">SIDEBAR</div>
            <div className="content">
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="history" element={<History/>}/>
                    <Route path="admin" element={<Admin/>}/>
                    <Route path="*" element={<Error/>}/>
                </Routes>
            </div>
        </div>
    );
}

export default App;
