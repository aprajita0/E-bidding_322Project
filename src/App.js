import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import './app.css';
import Home from './frontend/pages/home';
import U_login from './frontend/pages/user_login';
import Deposit from './frontend/pages/deposit';
import Complaint from './frontend/pages/complaint_form';
import Withdraw from './frontend/pages/withdraw';
import Balance_menu from './frontend/pages/balance_menu';
import Add_Listings from './frontend/pages/add_listings';
import V_registration from './frontend/pages/visitor_registration';
import browse_listings from './frontend/pages/browse_listings';
import trustsphere_logo from './frontend/assets/logo.png';
import '@fontsource/dm-sans';

function LogoutButton({ setIsLoggedIn }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token'); 
        setIsLoggedIn(false); 
        navigate('/'); 
    };

    return (
        <button
            style={{
                position: 'absolute',
                top: '15px',
                right: '20px',
                color: 'white', 
                backgroundColor: '#625834',
                border: 'none',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '14px',
                borderRadius: '4px'
            }}
            onClick={handleLogout}
        >
            Logout
        </button>
    );
}

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const handleLogin = () => {
        setIsLoggedIn(true);
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
                            {isLoggedIn ? (
                                <Link to="/my_account">Profile</Link>
                            ) : (
                                <Link to="/U_login">Login/Registration</Link>
                            )}
                        </li>
                    </ul>
                    {isLoggedIn && <LogoutButton setIsLoggedIn={setIsLoggedIn} />}
                </nav>

                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/U_login" element={<U_login onLogin={handleLogin} />} />
                    <Route path="/browse_listings" element={isLoggedIn ? <browse_listings /> : <Navigate to="/U_login" />} />
                    <Route path="/my_account" element={isLoggedIn ? <div>My Account Page</div> : <Navigate to="/U_login" />} />
                    <Route path="/V_registration" element={<V_registration />} />
                    <Route path="/Deposit" element={isLoggedIn ? <Deposit /> : <Navigate to="/U_login" />} />
                    <Route path="/Withdraw" element={isLoggedIn ? <Withdraw /> : <Navigate to="/U_login" />} />
                    <Route path="/Add_Listings" element={isLoggedIn ? <Add_Listings /> : <Navigate to="/U_login" />} />
                    <Route path="/Complaint" element={isLoggedIn ? <Complaint /> : <Navigate to="/U_login" />} />
                    <Route path="/Balance_menu" element={isLoggedIn ? <Balance_menu /> : <Navigate to="/U_login" />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;

