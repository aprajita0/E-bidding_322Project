import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '@fontsource/dm-sans';
import './styles/create_raffle.css';

const Create_raffle = () => {
    const [raffleName, setRaffleName] = useState('');
    const [prize, setPrize] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const navigate = useNavigate();
    const handleReturn = () => {
       navigate('/Vip_profile');
    };

    const handleRaffle = async (event) => {
        event.preventDefault();

        const formData = {
            raffle_name: raffleName,
            prize: prize,
            start_date: startDate,
            end_date: endDate,
        };

        try {
            const response = await fetch('/api/users/add-raffle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            if (response.ok) {
                alert('Your raffle has been created!');
                navigate('/Vip_profile');
            } else {
                alert(`Failed to add raffle: ${result.error}`);
            }
        } catch (error) {
            console.error('Error adding raffle:', error);
            alert('Error adding raffle');
        }
    };

    return (
        <div className="create_raffle-container">
            <div className="create_raffle-box">
                <h2 className="create_raffle-sign">Add Your Raffle Details</h2>
                <form className="create_raffle-form" onSubmit={handleRaffle}>
                    <div className="raffle-container">
                        <label className="raffle-field-label" htmlFor="raffle_name">Raffle Name</label>
                        <input className="raffle-input" type="text" id="raffle__name" placeholder="Enter the name of your raffle" value={raffleName} onChange={(e) => setRaffleName(e.target.value)}  required />
                    </div>
                    <div className="raffle-container">
                        <label className="raffle-field-label" htmlFor="raffle_name">Enter the Prize</label>
                        <input className="raffle-input" type="text" id="raffle__name" placeholder="Enter the your raffle prize" value={prize} onChange={(e) => setPrize(e.target.value)}  required />
                    </div>
                    <div className="raffle-container">
                        <label className="raffle-field-label" htmlFor="listing_date">Start Date</label>
                        <input className="raffle-input" type="datetime-local" id="raffle_start_date" value={startDate} onChange={(e) => setStartDate(e.target.value)}  required />
                    </div>
                    <div className="raffle-container">
                        <label className="raffle-field-label" htmlFor="listing_date">End Date</label>
                        <input className="raffle-input" type="datetime-local" id="raffle_end_date" value={endDate} onChange={(e) => setEndDate(e.target.value)}  required />
                    </div>
                    <div className="listings-container button-container">
                        <button className="return-vip-profile" type="button" onClick={handleReturn}>Return</button>
                        <button className="upload-raffle" type="submit">Upload My Raffle</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Create_raffle;

