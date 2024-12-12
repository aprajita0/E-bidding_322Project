import React, { useState, useEffect } from 'react';
import '../components/raffle_history.css'; // Import the CSS file for styling

const RaffleHistory = () => {
    const [raffles, setRaffles] = useState([]);
    const [entries, setEntries] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchRaffles();
        fetchRaffleEntries();
    }, []);

    const fetchRaffles = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/users/get-raffles', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Fetched raffles:", data);
                setRaffles(data);
            } else {
                const errorData = await response.json();
                setError(`Error fetching raffles: ${errorData.error}`);
            }
        } catch (error) {
            setError(`Error fetching raffles: ${error.message}`);
        }
    };

    const fetchRaffleEntries = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/users/get-raffle-entries', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Fetched raffle entries:", data);
                if (data.message === 'You have won a prize.') {
                    alert(data.message);
                } else {
                    setEntries(data);
                }
            } else {
                const errorData = await response.json();
                setError(`Error fetching raffle entries: ${errorData.error}`);
            }
        } catch (error) {
            setError(`Error fetching raffle entries: ${error.message}`);
        }
    };

    return (
        <div className="raffle-history-container">
            <h2>Raffle History</h2>
            {error && <p className="error">{error}</p>}
            <div className="raffles">
                <h3>Your Raffle Listings</h3>
                {raffles.length > 0 ? (
                    <ul>
                        {raffles.map(raffle => (
                            <li key={raffle._id}>{raffle.name}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No raffles found.</p>
                )}
            </div>
            <div className="entries">
                <h3>Raffles You've Entered</h3>
                {entries.length > 0 ? (
                    <ul>
                        {entries.map(entry => (
                            <li key={entry._id}>{entry.raffle_id}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No raffle entries found.</p>
                )}
            </div>
        </div>
    );
};

export default RaffleHistory;
