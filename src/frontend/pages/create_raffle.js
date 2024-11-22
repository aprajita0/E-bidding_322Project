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
       navigate('/vip_profile');
    };

    return (
        <div className="create_raffle-container">
            <div className="create_raffle-box">
                <h2 className="create_raffle-sign">Add Your Raffle Details</h2>
                <form className="create_raffle-form" >
                    <div className="raffle-container">
                        <label className="raffle-field-label" htmlFor="raffle_name">Raffle Name</label>
                        <input className="raffle-input" type="text" id="raffle__name" placeholder="Enter the name of your raffle" value={raffleName}required />
                    </div>
                    <div className="raffle-container">
                        <label className="raffle-field-label" htmlFor="raffle_name">Enter the Prize</label>
                        <input className="raffle-input" type="text" id="raffle__name" placeholder="Enter the your raffle prize" value={raffleName}required />
                    </div>
                    <div className="raffle-container">
                        <label className="raffle-field-label" htmlFor="listing_date">Start Date</label>
                        <input className="raffle-input" type="datetime-local" id="raffle_start_date" value={startDate} required />
                    </div>
                    <div className="raffle-container">
                        <label className="raffle-field-label" htmlFor="listing_date">End Date</label>
                        <input className="raffle-input" type="datetime-local" id="raffle_end_date" value={endDate} required />
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
