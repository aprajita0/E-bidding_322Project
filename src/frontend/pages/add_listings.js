import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '@fontsource/dm-sans';
import './styles/add_listings.css';

const Add_Listings = () => {
    const [itemName, setItemName] = useState('');
    const [itemDescription, setItemDescription] = useState('');
    const [itemType, setItemType] = useState('');
    const [listingAmount, setListingAmount] = useState('');
    const [listingDate, setListingDate] = useState('');
    const navigate = useNavigate();
    const role = localStorage.getItem('role');

    const handleReturn = () => {
        if (role === 'user') {
            navigate('/user_profile');
        } else if (role === 'visitor') {
            navigate('/withdraw');
        } else if (role === 'superuser') {
            navigate('/superusers_profile');
        }
    };

    const handleListing = async (event) => {
        event.preventDefault();

        const formData = {
            name: itemName,
            description: itemDescription,
            type: itemType,
            amount: listingAmount,
            date_listed: listingDate
        };

        try {
            const response = await fetch('/api/users/add-listing', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            if (response.ok) {
                alert('Your listing has been added!');
                if (role === 'user') {
                    navigate('/user_profile');
                } else if (role === 'visitor') {
                    navigate('/withdraw');
                } else if (role === 'superuser') {
                    navigate('/superusers_profile');
                }
            } else {
                alert(`Failed to add listing: ${result.error}`);
            }
        } catch (error) {
            console.error('Error adding listing:', error);
            alert('Error adding listing');
        }
    };

    return (
        <div className="add_listings-container">
            <div className="add_listings-box">
                <h2 className="add_listings-sign">Add Your Listing</h2>
                <form className="add_listings-form" onSubmit={handleListing}>
                    <div className="listings-container">
                        <label className="field-label" htmlFor="item_name">Item/Service Name</label>
                        <input
                            className="listing-input"
                            type="text"
                            id="item_name"
                            placeholder="Enter the name of the item/service"
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="listings-container">
                        <label className="field-label" htmlFor="item_description">Item/Service Description</label>
                        <input
                            className="listing-input"
                            type="text"
                            id="item_description"
                            placeholder="Enter your description"
                            value={itemDescription}
                            onChange={(e) => setItemDescription(e.target.value)}
                            required
                        />
                    </div>
                    <div className="listings-container">
                        <label className="field-label" htmlFor="item_type">Item/Service Type</label>
                        <select
                            className="listing-input"
                            id="item_type"
                            value={itemType}
                            onChange={(e) => setItemType(e.target.value)}
                            required
                        >
                            <option value="">Select Item/Service Type</option>
                            <option value="selling">Selling</option>
                            <option value="renting">Renting</option>
                            <option value="buying">Buying</option>
                        </select>
                    </div>
                    <div className="listings-container">
                        <label className="field-label" htmlFor="listing_amount">Listing Amount</label>
                        <input
                            className="listing-input"
                            type="number"
                            id="listing_amount"
                            placeholder="Enter an amount"
                            value={listingAmount}
                            onChange={(e) => setListingAmount(e.target.value)}
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>
                    <div className="listings-container">
                        <label className="field-label" htmlFor="listing_date">Date Listing</label>
                        <input
                            className="listing-input"
                            type="datetime-local"
                            id="listing_date"
                            value={listingDate}
                            onChange={(e) => setListingDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="listings-container button-container">
                        <button className="return-user-profile" type="button" onClick={handleReturn}>Return</button>
                        <button className="upload-finish" type="submit">Upload My Listing</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Add_Listings;
