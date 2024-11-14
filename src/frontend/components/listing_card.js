import React from 'react';
import { useNavigate } from 'react-router-dom';
import './listing_card.css';

const ListingCard = ({listing}) => {
    const navigate = useNavigate(); 

    const formatAmount = (amount) => {
        if (amount && typeof amount === 'object' && amount.$numberDecimal) {
            amount = amount.$numberDecimal; 
        }
        const number = Number(amount);
        return isNaN(number) ? "Not entered" : number.toFixed(2);
    };

    const handleCardClick = () => {
        console.log('Listing clicked:', listing);
        navigate(`/browse_listings/${listing._id}`);
    };

    return (
        <div className="listing-card" onClick={handleCardClick}>
            <div className="card-name">{listing.name}</div>
            <div className="card-description">{listing.description}</div>
            <div className="card-label"> Type: {listing.type}</div>
            <div className="card-label"> Price Range: ${formatAmount(listing.amount)}</div>
            <div className="card-label"> Listed On: {new Date(listing.date_listed).toLocaleDateString()}</div>
        </div>
    );
};

export default ListingCard;

