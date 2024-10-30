import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './app.css';
import Home from './frontend/pages/home';
import U_login from './frontend/pages/user_login';
import Deposit from './frontend/pages/deposit';       
import Withdraw from './frontend/pages/withdraw';        
import V_registration from './frontend/pages/visitor_registration';
import trustsphere_logo from './frontend/assets/logo.png';
import '@fontsource/dm-sans'; 

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <Router>
            <div>
                <nav>
                    <div className="logo">
                        <img src={trustsphere_logo} alt="Logo" className="logo" />
                    </div>
                    <div className={`menu ${menuOpen ? 'open' : ''}`} onClick={toggleMenu}>
                        Menu
                    </div>
                    <ul className={`menu-list ${menuOpen ? 'open' : ''}`}>
                        <li>
                            <Link to="/">Home</Link>
                        </li>
                        <li>
                            <Link to="/browse_listings">Browse</Link>
                        </li>
                        <li>
                            <Link to="/U_login">Login/Registration</Link>
                        </li>
                        <li>
                            <Link to="/my_account">Profile</Link>
                        </li>
                    </ul>
                </nav>

                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/U_login" element={<U_login />} />
                    <Route path="/browse_listings" element={isLoggedIn ? <div>Browse</div> : <Navigate to="/U_login" />} />
                    <Route path="/my_account" element={isLoggedIn ? <div>My Account Page</div> : <Navigate to="/U_login" />} />
                    <Route path="/V_registration" element={<V_registration />} />
                    <Route path="/Deposit" element={<Deposit />} />
                    <Route path="/Withdraw" element={<Withdraw />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;

