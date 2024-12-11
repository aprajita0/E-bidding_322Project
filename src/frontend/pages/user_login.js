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

    //for checking VIP- waiting for updated check-VIP api
    const checkVIPStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found. User is not authenticated.');
            }
            
            const response = await fetch('/api/users/check-vip', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
    
            if (!response.ok) {
                throw new Error('Failed to check VIP status.');
            }
    
            return await response.json();
        } catch (error) {
            console.error('Error checking VIP status:', error);
            throw error;
        }
    }; 
    
    const checkUserSuspension = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/users/suspend-reguser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ user_id: userId }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Suspension Check:', data);

                if (data.user && data.user.role === 'banned') {
                    return 'banned';
                }

                //return true if user suspended
                return data.user && data.user.account_status === false;
            } else {
                const errorResponse = await response.json();
                console.error('Suspension Error:', errorResponse.error || 'Unexpected error');
                return false;
            }
        } catch (err) {
            console.error('Error checking suspension:', err.message);
            alert('Server error while checking suspension.');
            return false;
        }
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
                console.log('Login successful:', data);

                localStorage.setItem('username', data.username);
                localStorage.setItem('role', data.role);
                localStorage.setItem('user_id', data.user_id); 
                localStorage.setItem('token', data.token); 
                localStorage.setItem('userId', data.userId);


                if (data.role === 'reguser') {
                    const suspensionStatus = await checkUserSuspension(data.userId);
                
                    if (suspensionStatus === 'banned') {
                        alert('Your account has been banned. You are being logged out.');
                        localStorage.clear();
                        navigate('/');
                        return;
                    }
                
                    if (suspensionStatus === true) {
                        console.log("User is suspended.");
                        alert('Your account has been suspended.');
                        navigate('/suspension_info');
                        return;
                    }
                }

                let isVIP = false;
                if (data.role === 'reguser' || data.role === 'vip') {
                    try {
                        isVIP = await checkVIPStatus(data.token);
                    } catch (error) {
                        console.warn('Unable to check VIP status. Defaulting to provided role.');
                    }
                }

                if (isVIP && data.role !== 'vip') {
                    console.log('User upgraded to VIP based on VIP check.');
                    data.role = 'vip';
                    localStorage.setItem('role', 'vip');
                }
                
                onLogin();
                if (data.role === 'reguser') {
                    navigate('/user_profile');
                } else if (data.role === 'visitor') {
                    navigate('/visitor_profile');
                } else if (data.role === 'superuser') {
                    navigate('/superusers_profile');
                }else if (data.role === 'vip') {
                    navigate('/Vip_profile');
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


