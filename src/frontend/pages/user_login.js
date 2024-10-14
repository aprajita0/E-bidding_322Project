import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/user_login.css'; 


const U_login = () => {
    const navigate = useNavigate();
    const handleRegister = () => {
        navigate('/V_registration');
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2 className="login-sign">Login</h2>
                <form className="login-form">
                    <div>
                        <label className="login-label" htmlFor="username">Username</label>
                        <input className="login-input" type="username" id="username" placeholder="Enter your username" required/>
                    </div>
                    
                    <div className="login-pass">
                        <label className="login-label" htmlFor="password">Password</label>
                        <input className="login-input" type="password" id="password" placeholder="Enter your password" required />
                    </div>
                    <div>
                        <button className="sign-in" type="submit">Login</button>
                        <button className="register-page"  type="button" onClick={handleRegister}>Register</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default U_login;
