import React from 'react';
import Header from "./components/header/Header";
import {Route, Routes} from "react-router-dom";
import Home from "./components/pages/Home";
import Error from "./components/pages/Error";
import History from "./components/pages/History";
import Admin from "./components/pages/Admin";

function App() {
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
