import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate} from 'react-router-dom';
import './app.css';
import Home from './frontend/pages/home';
import U_login from './frontend/pages/user_login';
import Deposit from './frontend/pages/deposit';
import Complaint from './frontend/pages/complaint_form';
import Withdraw from './frontend/pages/withdraw';
import Balance_menu from './frontend/pages/balance_menu';
import User_profile from './frontend/pages/user_profile';
import Superusers_profile from './frontend/pages/superusers_profile';
import Add_Listings from './frontend/pages/add_listings';
import Visitor_profile from './frontend/pages/visitor_profile';
import V_registration from './frontend/pages/visitor_registration';
import Browse_listings from './frontend/pages/browse_listings';
import Listing_clicked from './frontend/components/listing_clicked';
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
                top: '20px',
                right: '20px',
                color: 'white', 
                fontFamily: 'DM Sans',
                backgroundColor: '#c7d8ad',
                border: 'none',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '17px',
                borderRadius: '4px',
                backgroundColor: '#625834',
                borderRadius: '20px'
            }}
            onClick={handleLogout}
        >
            Logout
        </button>
    );
}

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
    const role = localStorage.getItem('role');
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleUnload = () => {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('token');
        };
        window.addEventListener('beforeunload', handleUnload);

        return () => {
            window.removeEventListener('beforeunload', handleUnload);
        };
    }, []); 

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const handleLogin = () => {
        setIsLoggedIn(true);
    };

    return (
        <Router>
            <div className="app-container">
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
                                role === 'reguser' ? (
                                <Link to="/user_profile">Profile</Link>
                            ) : role === 'visitor' ? (
                                <Link to="/visitor_profile">Profile</Link>
                            ) : role === 'superuser' ? (
                                <Link to="/superuser_profile">Profile</Link>
                            ) : null
                        ) : (                            
                                <Link to="/U_login">Login/Registration</Link>
                            )}
                        </li>
                    </ul>
                    {isLoggedIn && <LogoutButton setIsLoggedIn={setIsLoggedIn} />}
                </nav>

                <div className="content">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/U_login" element={<U_login onLogin={handleLogin} />} />
                        <Route path="/Browse_listings" element={isLoggedIn ? <Browse_listings /> : <Navigate to="/U_login" />} />
                        <Route path="/my_account" element={isLoggedIn ? <div>My Account Page</div> : <Navigate to="/U_login" />} />
                        <Route path="/V_registration" element={<V_registration />} />
                        <Route path="/User_profile" element={<User_profile />} />
                        <Route path="/Superusers_profile" element={<Superusers_profile />} />
                        <Route path="/Visitor_profile" element={<Visitor_profile />} />
                        <Route path="/browse_listings/:id" element={<Listing_clicked />} />
                        <Route path="/Deposit" element={isLoggedIn ? <Deposit /> : <Navigate to="/U_login" />} />
                        <Route path="/Withdraw" element={isLoggedIn ? <Withdraw /> : <Navigate to="/U_login" />} />
                        <Route path="/Add_Listings" element={isLoggedIn ? <Add_Listings /> : <Navigate to="/U_login" />} />
                        <Route path="/Complaint" element={isLoggedIn ? <Complaint /> : <Navigate to="/U_login" />} />
                        <Route path="/Balance_menu" element={isLoggedIn ? <Balance_menu /> : <Navigate to="/U_login" />} />
                    </Routes>
                </div>
                <footer className="footer-box">
                    <div class="footer-content"></div>
                    <span class="trustSphere-title">TrustSphere</span>
                    <span class="divider">|</span>
                    <span class="trustSphere-address"> The City College of New York <br /> 160 Convent Ave <br /> New York, NY 10031</span>
                </footer>
            </div>
        </Router>
    );
}

export default App;
