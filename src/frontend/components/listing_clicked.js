import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './listing_clicked.css';

const Listing_clicked = () => {
    const navigate = useNavigate(); 
    const {id} = useParams();   
    const [listing, setListing] = useState(null); 
    const [error, setError] = useState(''); 


    const formatAmount = (amount) => {
        if (amount && typeof amount === 'object' && amount.$numberDecimal) {
            return amount.$numberDecimal;
        }
        return amount;
    };

    useEffect(() => {
        const fetchListingDetails = async () => {
            try {
                const response = await fetch(`/api/users/get-listing/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setListing(data);
                } else {
                    setError('Failed to fetch');
                }
            } catch (error) {
                console.error('Error fetching listing details:', error);
                setError('An error occurred while fetching the');
            } 
        };

        fetchListingDetails();
    }, [id]);

    const handleReturn = () => {
        navigate('/browse_listings');  
    };

    const handleComment = () => {
        navigate('/browse_listings');  
    };

    if (error) {
        return <div>{error}</div>;
    }
    if (!listing) {
        return <div>Loading...</div>;
    }


    return (
        <div className="details-container">
            <div className="details-name"> {listing.name}</div>
            <div className="details-description"> Description: {listing.description}</div>
            <div className="details-type"> Type: {listing.type}</div>
            <div className="details-amount"> Price Range: ${formatAmount(listing.amount)}</div>
            <div className="details-date"> Date Listed: {new Date(listing.date_listed).toLocaleDateString()}</div>
            <div className="comments-section"> Comments Section:</div>
            <textarea className="add-comment" id="add-comment" placeholder="Add your comment" maxLength="250"></textarea>
            <button className="comment-button"  type="submit" onClick={handleComment}>Submit Comment</button>
            <button onClick={handleReturn} className="listing-button">Return</button>
        </div>
    );
};

export default Listing_clicked;

