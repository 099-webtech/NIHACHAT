// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Import Router components
import MainContent from './pages/Chat';
import LoginSignup from './pages/LoginSignup';
import Home from './pages/Home';
// Import FontAwesomeIcon and specific icons you need
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee } from '@fortawesome/free-solid-svg-icons';

function App() {
    return (
        <Router>
            <div className="container">
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/maincontent" element={<MainContent />} />
                    <Route path="/login-signup" element={<LoginSignup />} />
                </Routes>
                
                
            </div>
        </Router>
    );
}

export default App;
