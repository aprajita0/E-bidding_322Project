import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '@fontsource/dm-sans'; 
import './styles/deposit.css'; 

const Deposit = ({ setIsLoggedIn }) => {
    const navigate = useNavigate();
    const role = localStorage.getItem('role');
    const [depositAmount, setDepositAmount] = useState('');
    const [accountBalance, setAccountBalance] = useState(0);
    const [error, setError] = useState('');

    const checkVIPStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return false;
            }

            const response = await fetch('/api/users/check-vip', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                return false;
            }

            const result = await response.json();
            return result.vip || false;
        } catch (error) {
            return false;
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        window.location.href = '/U_login';
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
                    let balance = data.account_balance;

                    if (balance && typeof balance === 'object' && balance.$numberDecimal) {
                        balance = parseFloat(balance.$numberDecimal);
                    } else {
                        balance = parseFloat(balance) || 0;
                    }

                    setAccountBalance(balance);
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

    const handleDeposit = async () => {
        setError('');
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return;
            }
    
            const response = await fetch('/api/users/add-balance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ amount: depositAmount }),
            });
    
            if (response.ok) {
                const isVIP = await checkVIPStatus();
                if (isVIP) {
                    localStorage.setItem('role', 'vip');
                    alert('Congratulations, you are now a VIP. Please sign back in to see your profile!');
                    handleLogout();
                } else {
                    console.log('User is still not a VIP');
                }

                setDepositAmount('');
                const updatedRole = localStorage.getItem('role');
                if (updatedRole === 'reguser') {
                    navigate('/user_profile');
                } else if (updatedRole === 'superuser') {
                    navigate('/superusers_profile');
                } else if (updatedRole === 'vip') {
                    navigate('/Vip_profile');
                }
            } else {
                const result = await response.json();
                setError(result.error);
            }
        } catch (err) {
            console.error('Error during deposit:', err);
            setError('Server error');
        }
    };

    return (
        <div className="deposit-container">
            <div className="deposit-box">
                <h2 className="deposit-sign">Deposit Money</h2>
                <form className="deposit-form">
                    <div className="balance-container">
                        <label className="balance-label" htmlFor="balance">Current Account Balance: </label>
                        <div className="account-balance"> ${accountBalance}</div>
                    </div>
                    <div className="balance-container">
                        <label className="balance-label" htmlFor="balance">Amount Depositing: </label>
                        <input
                            className="deposit-input"
                            type="number"
                            id="deposit_amount"
                            min="0"
                            step="0.01"
                            placeholder="Enter an amount"
                            required
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                        />
                    </div>
                    <div className="balance-container"> 
                        <label className="field-label" htmlFor="balance">Enter your Credit Card Information  </label>
                    </div>
                    <div className="balance-container"> 
                        <label className="balance-label" htmlFor="balance">Cardholder Name </label>
                        <input className="deposit-input" type="text" id="card_name" placeholder="Enter the name on your card" required/>
                    </div>
                    <div className="balance-container"> 
                        <label className="balance-label" htmlFor="balance">Card Number </label>
                        <input className="deposit-input" type="text" id="card_num"  minlength="15" maxlength="16"  placeholder="Enter your credit card number" required/>
                    </div>
                    <div className="balance-container"> 
                        <label className="balance-label" htmlFor="balance">Expiration Date </label>
                        <input className="deposit-input" type="month" id="expiration_date" placeholder="Expiration Date" required/>
                    </div>
                    <div className="balance-container"> 
                        <label className="balance-label" htmlFor="balance">CVV Code </label>
                        <input className="deposit-input" type="text" inputmode="numeric" minlength="3" maxlength="4" placeholder="Enter your CVV number" required/>
                    </div>
                    <div className="balance-container"> 
                        <label className="field-label" htmlFor="billing">Billing Address </label>
                    </div>
                    <div className="balance-container"> 
                        <label className="balance-label" htmlFor="balance">Address Line 1 </label>
                        <input className="deposit-input" type="text" id="address1" placeholder="Enter your address" required/>
                    </div>
                    <div className="balance-container"> 
                        <label className="balance-label" htmlFor="balance">Address Line 2 </label>
                        <input className="deposit-input" type="text" id="address2" placeholder="Enter your address"/>
                    </div>
                    <div className="balance-container"> 
                        <label className="balance-label" htmlFor="balance">City </label>
                        <input className="deposit-input" type="text" id="city" placeholder="City" required/>
                    </div>
                    <div className="balance-container"> 
                        <label className="balance-label" htmlFor="balance">State </label>
                        <input className="deposit-input" type="text" id="state" placeholder="State" required/>
                    </div>
                    <div className="balance-container"> 
                        <label className="balance-label" htmlFor="balance">Zip Code </label>
                        <input className="deposit-input" type="text" id="zip-code" placeholder="Enter your zip code" required/>
                    </div>
                    <div>
                        <button className="return-profile" type="button" onClick={() => navigate('/balance_menu')}>Return</button>
                        <button className="deposit-finish"  type="button" onClick={handleDeposit}>Deposit</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Deposit;
