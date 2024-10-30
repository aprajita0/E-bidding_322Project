import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '@fontsource/dm-sans';
import './styles/add_listings.css';

const Add_Listings = () => {
    const navigate = useNavigate();
    const handleListing = () => {
        navigate();
    };

    const [accountBalance, setAccountBalance] = useState(0);
    const [itemType, setItemType] = useState(''); 

    return (
        <div className="add_listings-container">
            <div className="add_listings-box">
                <h2 className="add_listings-sign">Add Your Listing</h2>
                <form className="add_listings-form" onSubmit={(e) => e.preventDefault()}>
                    <div className="listings-container">
                        <label className="field-label" htmlFor="info">Enter Your Item/Service Information</label>
                    </div>
                    <div className="listings-container">
                        <label className="balance-label" htmlFor="item_name">Item/Service Name</label>
                        <input className="listing-input" type="text" id="item_name" placeholder="Enter the name of the item/service" required/>
                    </div>
                    <div className="listings-container">
                        <label className="balance-label" htmlFor="item_description">Item/Service Description</label>
                        <input className="listing-input" type="text" id="item_description" placeholder="Enter your description" required/>
                    </div>
                    <div className="listings-container">
                        <label className="balance-label" htmlFor="item_type">Item/Service Type</label>
                        <select className="deposit-input" id="item_type" value={itemType} onChange={(e) => setItemType(e.target.value)} required>
                            <option value="">Select Item/Service Type</option>
                            <option value="selling">Selling</option>
                            <option value="renting">Renting</option>
                            <option value="buying">Buying</option>
                        </select>
                    </div>
                    <div className="listings-container"> 
                        <label className="balance-label" htmlFor="balance">Listing Amount:  </label>
                        <input className="listing-input" type="number" id="listing_amount"  min="0" step="0.01" placeholder="Enter an amount" required/>
                    </div>
                    <div className="listings-container"> 
                        <label className="balance-label" htmlFor="balance">Date Listing </label>
                        <input className="listing-input" type="datetime-local" id="listing_date" placeholder="Date Listing" required/>
                    </div>
                    <div className="listings-container button-container">
                        <button className="return-profile" type="submit">Return</button>
                        <button className="upload-finish" type="button" onClick={handleListing}>Upload My Listing</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Add_Listings;
