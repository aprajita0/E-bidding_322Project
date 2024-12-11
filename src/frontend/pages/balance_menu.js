import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '@fontsource/dm-sans';
import './styles/balance_menu.css';

const Balance_menu = () => {
    const navigate = useNavigate();
    const [accountBalance, setAccountBalance] = useState(0);
    const [error, setError] = useState('');
    const role = localStorage.getItem('role');

    const handleDeposit = () => {
        navigate('/deposit');
    };

    const handleWithdraw = () => {
        navigate('/withdraw');
    };
    
    const handleReturn = () => {
        if (role === 'reguser') {
            navigate('/user_profile')
        } else if (role === 'superuser') {
            navigate('/superusers_profile');
        } else if (role === 'vip') {
            navigate('/Vip_profile')
        }
    };

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const token = localStorage.getItem('token'); 
                const response = await fetch('/api/users/get-balance', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`, 
                    },
                });

                if (response.ok) {
                    const data = await response.json();

                    const balance = data.account_balance;
                    if (balance && typeof balance === 'object' && balance.$numberDecimal) {
                        setAccountBalance(parseFloat(balance.$numberDecimal)); 
                    } else {
                        setAccountBalance(balance); 
                    }
                } else {
                    const result = await response.json();
                    setError(result.error || 'Cannot show balance');
                }
            } catch (err) {
                console.error('Error fetching balance:', err);
                setError('Server error');
            }
        };

        fetchBalance();
    }, []); 

    return (
        <div className="deposit-container">
            <div className="deposit-box">
                <h2 className="deposit-sign">Account Balance Management</h2>
                <form className="deposit-form">
                    <div className="balance-container">
                        <label className="balance-label" htmlFor="balance">Current Account Balance: </label>
                        <div className="account-balance">${accountBalance}</div>
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <div>
                        <button className="withdraw-nav" type="button" onClick={handleWithdraw}>Withdraw</button>
                        <button className="deposit-nav" type="button" onClick={handleDeposit}>Deposit</button>
                        <button className="return-profile" type="button" onClick={handleReturn}>Return</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Balance_menu;

