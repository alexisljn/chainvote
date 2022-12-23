import React from 'react';
import Header from "./components/header/Header";

function App() {
    return (
        <div className="grid">
            <Header/>
            {/*Routing */}
            <div className="sidebar">SIDEBAR</div>
            <div className="content">CONTENT</div>
        </div>
    );
}

export default App;
