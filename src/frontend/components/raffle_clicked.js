import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './listing_clicked.css'; 

const Raffle_clicked = () => {
    const navigate = useNavigate(); 
    const {id} = useParams();   
    const role = localStorage.getItem('role');
    const [raffle, setRaffle] = useState(null); 

    const fetchRaffleDetails = async () => {
        try {
            const response = await fetch(`/api/users/get-raffle/${id}`);
            if (response.ok) {
                const data = await response.json();
                setRaffle(data);
            } else {
                setError('Failed to fetch listing details');
            }
        } catch (error) {
            console.error('Error fetching listing details:', error);
            setError('An error occurred while fetching the listing details');
        } 
    };

    useEffect(() => {
        fetchRaffleDetails();
    }, [id]);

    const handleReturn = () => {
        navigate('/raffle_listings');  
    };

    const handleEnter = async () => {
        try {
            const token = localStorage.getItem("token"); 
    
            if (!token) {
                alert("You must be logged in to enter the raffle.");
                return;
            }
            const raffle_id = id; 
    
            const response = await fetch("/api/users/enter-raffle", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`, 
                },
                body: JSON.stringify({ raffle_id }), 
            });
    
            const data = await response.json();
            if (response.ok) {
                alert("Congratulations, you have been entered into our raffle!");
            } else {
                alert("Unfortunately, you do not meet the requirements to enter our raffle");
            }
        } catch (error) {
            console.error("Error entering user in raffle:", error);
        }
    };
    
        
    if (!raffle) {
        return <div>Loading...</div>;
    }

    return (
        <div className="details-container">
            <div className="details-name"> {raffle.raffle_name}</div>
            <div className="details-description"> Prize: {raffle.prize}</div>
            <div className="details-date"> Start Date: {new Date(raffle.start_date).toLocaleDateString()}</div>
            <div className="details-date"> End Date: {new Date(raffle.end_date).toLocaleDateString()}</div>
            <div class="vertical-line"></div>

            <div className="listing-btn-container">
                 <button className="listing-button" onClick={handleEnter}> Enter Raffle</button>
                <button onClick={handleReturn} className="listing-button">Return</button>
            </div>
        </div>
    );
};

export default Raffle_clicked;
