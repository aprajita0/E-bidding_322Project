import React, { useState } from 'react';
import '@fontsource/dm-sans';
import { useNavigate } from 'react-router-dom';
import './styles/user_login.css';

const U_login = ({ onLogin }) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleRegister = () => {
        navigate('/V_registration');
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/users/login', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }), 
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('username', data.username);
                localStorage.setItem('role', data.role);
                localStorage.setItem('user_id', data.user_id); 
                localStorage.setItem('token', data.token); 
                onLogin(data.token, data.role);
                if (data.role === 'reguser') {
                    navigate('/user_profile');
                } else if (data.role === 'visitor') {
                    navigate('/visitor_profile');
                } else if (data.role === 'superuser') {
                    navigate('/superusers_profile');
                }
            } else {
                const result = await response.json();
                setError(result.message || 'Login failed, try again.');
            }
        } catch (err) {
            console.error('Error during login:', err);
            setError('Server error');
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2 className="login-sign">Login</h2>
                <form className="login-form" onSubmit={handleLogin}>
                    <div>
                        <label className="login-label" htmlFor="email">Email</label>
                        <input
                            className="login-input"
                            type="email"
                            id="email"
                            placeholder="Enter your email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    
                    <div className="login-pass">
                        <label className="login-label" htmlFor="password">Password</label>
                        <input
                            className="login-input"
                            type="password"
                            id="password"
                            placeholder="Enter your password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <div>
                        <button className="sign-in" type="submit">Login</button>
                        <button className="register-page" type="button" onClick={handleRegister}>Register</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default U_login;


