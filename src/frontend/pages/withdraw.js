import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '@fontsource/dm-sans'; 
import './styles/withdraw.css'; 

const Withdraw = () => {
    const navigate = useNavigate();
    const role = localStorage.getItem('role');
    const [accountBalance, setAccountBalance] = useState(0);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [error, setError] = useState(''); 

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

    const handleWithdraw = async () => {
        setError('');
    
        if (!withdrawAmount || withdrawAmount <= 0) {
            setError('Please enter a valid amount');
            return;
        }
        if (withdrawAmount > accountBalance) {
            setError('Insufficient balance.');
            return;
        }
    
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/users/withdraw-balance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ amount: withdrawAmount }),
            });
    
            if (response.ok) {
                setWithdrawAmount('');
                
                if (role === 'reguser') {
                    navigate('/user_profile');
                } else if (role === 'superuser') {
                    navigate('/superusers_profile');
                }
            } else {
                const result = await response.json();
                setError(result.error || 'Withdrawal failed');
            }
        } catch (err) {
            console.error('Error during withdrawal:', err);
            setError('Server error');
        }
    }; 

    return (
        <div className="withdraw-container">
            <div className="withdraw-box">
                <h2 className="withdraw-sign">Withdraw Money</h2>
                <form className="withdraw-form" onSubmit={(e) => e.preventDefault()}>
                    
                    <div className="balance-container">
                        <label className="balance-label" htmlFor="balance">Current Account Balance: </label>
                        <div className="account-balance"> ${accountBalance}</div>
                    </div>
                    
                    {error && <p className="error-message">{error}</p>}
                    
                    <div className="balance-container"> 
                        <label className="balance-label" htmlFor="withdraw_amount">Amount Withdrawing: </label>
                        <input 
                            className="withdraw-input" 
                            type="number" 
                            id="withdraw_amount" 
                            min="0" 
                            step="0.01" 
                            placeholder="Enter an amount" 
                            required 
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                        />
                    </div>
                    
                    <div className="balance-container">
                        <label className="field-label" htmlFor="billing">Enter Billing Information:</label>
                    </div>
                    
                    <div className="balance-container"> 
                        <label className="balance-label" htmlFor="card_name">Cardholder Name</label>
                        <input className="withdraw-input" type="text" id="card_name" placeholder="Enter the name on your card" required/>
                    </div>
                    <div className="balance-container"> 
                        <label className="balance-label" htmlFor="card_num">Card Number</label>
                        <input className="withdraw-input" type="text" id="card_num" minLength="15" maxLength="16" placeholder="Enter your credit card number" required/>
                    </div>
                    <div className="balance-container"> 
                        <label className="balance-label" htmlFor="expiration_date">Expiration Date</label>
                        <input className="withdraw-input" type="month" id="expiration_date" required/>
                    </div>
                    <div className="balance-container"> 
                        <label className="balance-label" htmlFor="cvv">CVV Code</label>
                        <input className="withdraw-input" type="text" inputMode="numeric" minLength="3" maxLength="4" placeholder="Enter your CVV number" required/>
                    </div>

                    <div className="balance-container"> 
                        <label className="balance-label" htmlFor="address1">Address Line 1</label>
                        <input className="withdraw-input" type="text" id="address1" placeholder="Enter your address" required/>
                    </div>
                    <div className="balance-container"> 
                        <label className="balance-label" htmlFor="address2">Address Line 2</label>
                        <input className="withdraw-input" type="text" id="address2" placeholder="Enter your address"/>
                    </div>
                    <div className="balance-container"> 
                        <label className="balance-label" htmlFor="city">City</label>
                        <input className="withdraw-input" type="text" id="city" placeholder="City" required/>
                    </div>
                    <div className="balance-container"> 
                        <label className="balance-label" htmlFor="state">State</label>
                        <input className="withdraw-input" type="text" id="state" placeholder="State" required/>
                    </div>
                    <div className="balance-container"> 
                        <label className="balance-label" htmlFor="zip-code">Zip Code</label>
                        <input className="withdraw-input" type="text" id="zip-code" placeholder="Enter your zip code" required/>
                    </div>

                    <div>
                        <button className="return-profile" type="button" onClick={() => navigate('/balance_menu')}>Return</button>
                        <button className="withdraw-finish" type="button" onClick={handleWithdraw}>Withdraw</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Withdraw;


