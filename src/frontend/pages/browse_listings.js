import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import ListingCard from '../components/listing_card.js';
import './styles/browse_listings.css';
import '@fontsource/dm-sans'; 

const Browse_listings = () => {
    const [listings, setListings] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [accountBalance, setAccountBalance] = useState(0);
    const [role, setRole] = useState('');

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const response = await fetch('/api/users/get-listing');
                const data = await response.json();
                if (response.ok) {
                    console.log('Fetched listings:', data);
                    setListings(data);
                } else {
                    throw new Error(data.error || 'Failed to fetch listings');
                }
            } catch (error) {
                setError(error.message);
            }
        };

        const fetchUserDetails = async (user_id) => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/users/check-vip', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ user_id }), // Send user_id in the request body
                });
        
                if (response.ok) {
                    const data = await response.json();
                    setRole(data.role);
                    setAccountBalance(data.account_balance);
                    if (data.message === 'User is VIP') {
                        // Handle the case where the user is VIP
                        console.log('User is VIP');
                    } else {
                        // Handle the case where the user is not VIP
                        console.log('User is not VIP');
                    }
                } else {
                    throw new Error('Failed to fetch user details');
                }
            } catch (error) {
                setError(error.message);
            }
        };
        
        fetchUserDetails();
        fetchListings();
    }, []);

    
    const handleCardClick = (listing) => {
        if (role === 'visitor') {
            setError('Visitors cannot bid on items. Apply to be a user today.');
        } else if (role === 'user' || role === 'superuser' || role === 'vip') {
            navigate(`/listings/${listing.id}`);
        } else {
            setError('Unknown role. Please try again.');
        }
    };
    

    return (
        <div className="browse-listings">
            {error && <p className="error">{error}</p>}
            {listings.map(listing => (
                <ListingCard key={listing.id} listing={listing} onClick={handleCardClick} />
            ))}
        </div>
    );
};

export default Browse_listings;
