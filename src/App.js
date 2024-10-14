import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './app.css';
import Home from './frontend/pages/home';
import U_login from './frontend/pages/user_login';
import V_registration from './frontend/pages/visitor_registration';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    return (
        <Router>
            <div>
                <nav>
                    <ul>
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
                    <Route path="/browse_listings" element={isLoggedIn ? <div>Browse</div> : <Navigate to="/U_login" />}/>
                    <Route path="/my_account" element={isLoggedIn ? <div>My Account Page</div> : <Navigate to="/U_login" />}/>
                    <Route path="/V_registration" element={<V_registration />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;

