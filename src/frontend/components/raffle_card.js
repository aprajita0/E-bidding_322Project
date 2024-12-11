import React from 'react';
import { useNavigate } from 'react-router-dom';
import './listing_card.css';

const RaffleCard = ({raffle}) => {
    const navigate = useNavigate(); 

    const handleCardClick = () => {
        console.log('Raffle clicked:', raffle);
        navigate(`/raffle_listings/${raffle._id}`);
    };

    return (
        <div className="listing-card" onClick={handleCardClick}>
            <div className="card-name">{raffle.raffle_name}</div>
            <div className="card-description">{raffle.prize}</div>
            <div className="card-label"> Start Date: {new Date(raffle.start_date).toLocaleDateString()}</div>
            <div className="card-label"> End Date: {new Date(raffle.end_date).toLocaleDateString()}</div>
        </div>
    );
};

export default RaffleCard;

