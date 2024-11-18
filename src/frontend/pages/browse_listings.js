import React, { useState, useEffect } from 'react';
import ListingCard from '../components/listing_card.js';
import './styles/browse_listings.css';
import '@fontsource/dm-sans'; 

const Browse_listings = () => {
    const [listings, setListings] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const response = await fetch('/api/users/get-listing');
                const data = await response.json();
                if (response.ok) {
                    setListings(data);
                } else {
                    throw new Error(data.error || 'Failed to fetch listings');
                }
            } catch (error) {
                setError(error.message);
            }
        };

        fetchListings();
    }, []);

    const handleCardClick = (listing) => {
        navigate(`/listings/${listing.id}`);
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
