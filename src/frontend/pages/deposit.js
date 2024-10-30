import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '@fontsource/dm-sans'; 
import './styles/deposit.css'; 


const Deposit = () => {
    const navigate = useNavigate();
    const handleDeposit = () => {
        navigate();
    };

    const [accountBalance, setAccountBalance] = useState(0);

    return (
        <div className="deposit-container">
            <div className="deposit-box">
                <h2 className="deposit-sign">Deposit Money</h2>
                <form className="deposit-form">
                    <div className="balance-container"> 
                        <label className="balance-label" htmlFor="balance">Current Account Balance: </label>
                        <div className="account-balance">${accountBalance}</div>
                    </div>
                    <div className="balance-container"> 
                        <label className="balance-label" htmlFor="balance">Amount Depositing:  </label>
                        <input className="deposit-input" type="number" id="deposit_amount"  min="0" step="0.01" placeholder="Enter an amount" required oninput="validity.valid||(value='');"/>
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
                        <input className="deposit-input" type="date" id="expiration_date" placeholder="Expiration Date" required/>
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
                        <button className="return-profile" type="submit">Return</button>
                        <button className="deposit-finish"  type="button" onClick={handleDeposit}>Deposit</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Deposit;
