import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './listing_clicked.css';

const Listing_clicked = () => {
    const navigate = useNavigate(); 
    const {id} = useParams();   
    const [listing, setListing] = useState(null); 
    const [error, setError] = useState(''); 


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
            <div className="details-amount"> Price Range: ${formatMin(listing.price_from)} - ${formatMax(listing.price_to)}</div>
            <div className="details-date"> Date Listed: {new Date(listing.date_listed).toLocaleDateString()}</div>
            <div className="comments-section"> Comments Section:</div>
            <textarea className="add-comment" id="add-comment" placeholder="Add your comment" maxLength="250"></textarea>
            <button className="comment-button"  type="submit" onClick={handleComment}>Submit Comment</button>
            <button onClick={handleReturn} className="listing-button">Return</button>
        </div>
    );
};

export default Listing_clicked;


