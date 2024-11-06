import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/visitor_registration.css';
import '@fontsource/dm-sans';

const V_registration = () => {
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [address1, setAddress1] = useState('');
    const [address2, setAddress2] = useState('');
    const [error, setError] = useState('');

    const handleReturn = () => {
        navigate('/U_login');
    };

    const handleRegister = async (e) => {
        e.preventDefault(); 

        try {
            const response = await fetch('/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    username,
                    password,
                    email,
                    address_line_1: address1,
                    address_line_2: address2,
                    role: 'visitor'
                }),
            });

            if (response.ok) {
                navigate('/U_login'); 
            } else {
                const result = await response.json();
                setError(result.message || 'Error with registration');
            }
        } catch (err) {
            setError('Server error. Please try again later.');
        }
    };

    return (
        <div className="registration-container">
            <div className="registration-box">
                <h2 className="registration-sign">Account Creation</h2>
                <form className="registration-form" onSubmit={handleRegister}>
                    <div>
                        <label className="registration-label" htmlFor="first_name">First Name</label>
                        <input
                            className="registration-input"
                            type="text"
                            id="first_name"
                            placeholder="Enter your first name"
                            required
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="registration-label" htmlFor="last_name">Last Name</label>
                        <input
                            className="registration-input"
                            type="text"
                            id="last_name"
                            placeholder="Enter your last name"
                            required
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="registration-label" htmlFor="username">Username</label>
                        <input
                            className="registration-input"
                            type="text"
                            id="username"
                            placeholder="Enter your username"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="registration-pass">
                        <label className="registration-label" htmlFor="password">Password</label>
                        <input
                            className="registration-input"
                            type="password"
                            id="password"
                            placeholder="Enter your password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="registration-email">
                        <label className="registration-label" htmlFor="email">Email</label>
                        <input
                            className="registration-input"
                            type="email"
                            id="email"
                            placeholder="Enter your email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="registration-address1">
                        <label className="registration-label" htmlFor="address1">Address Line 1</label>
                        <input
                            className="registration-input"
                            type="text"
                            id="address1"
                            placeholder="Enter your address"
                            required
                            value={address1}
                            onChange={(e) => setAddress1(e.target.value)}
                        />
                    </div>
                    <div className="registration-address2">
                        <label className="registration-label" htmlFor="address2">Address Line 2</label>
                        <input
                            className="registration-input"
                            type="text"
                            id="address2"
                            placeholder="Enter your address"
                            value={address2}
                            onChange={(e) => setAddress2(e.target.value)}
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <div>
                        <button className="register_handle" type="submit">Register</button>
                        <button className="return-login" type="button" onClick={handleReturn}>Return to Sign-In</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default V_registration;
