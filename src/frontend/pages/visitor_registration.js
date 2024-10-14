import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/visitor_registration.css'; 

const V_registration = () => {
    const navigate = useNavigate();
    const handlereturn = () => {
        navigate('/U_login');
    };

    return (
        <div className="registration-container">
            <div className="registration-box">
                <h2 className="registration-sign">Account Creation</h2>
                <form className="registration-form">
                    <div>
                        <label className="registration-label" htmlFor="username">Username</label>
                        <input className="registration-input" type="username" id="username" placeholder="Enter your username" required/>
                    </div>
                    
                    <div className="registration-pass">
                        <label className="registration-label" htmlFor="password">Password</label>
                        <input className="registration-input" type="password" id="password" placeholder="Enter your password" required />
                    </div>
                    <div className="registration-email">
                        <label className="registration-label" htmlFor="password">Email</label>
                        <input className="registration-input" type="email" id="email" placeholder="Enter your email" required />
                    </div>
                    <div className="registration-address1">
                        <label className="registration-label" htmlFor="address1">Address Line 1</label>
                        <input className="registration-input" type="address1" id="address1" placeholder="Enter your address" required />
                    </div>
                    <div className="registration-address2">
                        <label className="registration-label" htmlFor="address2">Address Line 2</label>
                        <input className="registration-input" type="address2" id="address2" placeholder="Enter your address" required />
                    </div>
                    <div>
                        <button className="register_handle" type="submit">Register</button>
                        <button className="return-login"  type="button" onClick={handlereturn}>Return to Sign-In</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default V_registration;