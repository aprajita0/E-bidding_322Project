import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '@fontsource/dm-sans';
import '../components/win_raffle.css';

const WinRaffle = () => {
    const [raffleId, setRaffleId] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        setRaffleId(e.target.value);
    };

    const winRaffle = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/users/win-raffle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ raffle_id: raffleId }),
            });

            if (response.ok) {
                const data = await response.json();
                setMessage(`Winner selected successfully! Winner User ID: ${data.winner.user_id}`);
                setError('');
            } else {
                const errorData = await response.json();
                setError(`Error selecting winner: ${errorData.error}`);
                setMessage('');
            }
        } catch (error) {
            setError(`Error selecting winner: ${error.message}`);
            setMessage('');
        }
    };

    return (
        <div className="win-raffle-container">
            <h2>Choose a Raffle Winner!</h2>
            <input
                type="text"
                value={raffleId}
                onChange={handleInputChange}
                placeholder="Enter Raffle ID"
            />
            <button onClick={winRaffle}>Select Raffle Winner</button>
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default WinRaffle;
