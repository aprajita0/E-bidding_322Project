import React from 'react';
import { useNavigate } from 'react-router-dom';
import './listing_card.css';

const ListingCard = ({listing}) => {
    const navigate = useNavigate(); 

    const formatMin = (price_from) => {
        if (price_from && typeof price_from === 'object' && price_from.$numberDecimal) {
            price_from = price_from.$numberDecimal; 
        }
        const number = Number(price_from);
        return isNaN(number) ? "Not entered" : number.toFixed(2);
    };

    const formatMax = (price_to) => {
        if (price_to && typeof price_to === 'object' && price_to.$numberDecimal) {
            price_to = price_to.$numberDecimal; 
        }
        const number = Number(price_to);
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
            <div className="card-label"> Price Range: ${formatMin(listing.price_from)} - ${formatMax(listing.price_to)}</div>
            <div className="card-label"> Listed On: {new Date(listing.date_listed).toLocaleDateString()}</div>
        </div>
    );
};

export default ListingCard;


