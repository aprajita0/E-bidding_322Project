import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import RaffleCard from '../components/raffle_card.js';
import './styles/browse_listings.css';
import '@fontsource/dm-sans'; 

const Raffle_listings = () => {
    const [raffle, setRaffle] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRaffles = async () => {
            try {
                const token = localStorage.getItem('token'); // Get token from localStorage
                if (!token) {
                    setError('You must be logged in to view raffles.');
                    return;
                }

                const response = await fetch('/api/users/get-raffles', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`, // Pass token for authentication
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch raffles.');
                }

                const data = await response.json();
                console.log('Fetched raffles:', data);
                setRaffle(data); // Store fetched raffles in state
            } catch (err) {
                console.error('Error fetching raffles:', err.message);
                setError(err.message || 'Error fetching raffles.');
            }
        };
        fetchRaffles();
    }, []);

    
    const handleCardClick = (raffles) => { 
        navigate(`/raffles/${raffles.id}`); 
    };
    

    return (
        <div className="browse-listings">
            {error && <p className="error">{error}</p>}
            {raffle.map(raffle => (
                <RaffleCard key={raffle.id} raffle={raffle} onClick={handleCardClick} />
            ))}
        </div>
    );
};

export default Raffle_listings;