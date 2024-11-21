import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './listing_clicked.css'; 

const Listing_clicked = () => {
    const navigate = useNavigate(); 
    const {id} = useParams();   
    const role = localStorage.getItem('role');
    const [listing, setListing] = useState(null); 
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState([]); 
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

    const fetchListingDetails = async () => {
        try {
            const response = await fetch(`/api/users/get-listing/${id}`);
            if (response.ok) {
                const data = await response.json();
                setListing(data);
            } else {
                setError('Failed to fetch listing details');
            }
        } catch (error) {
            console.error('Error fetching listing details:', error);
            setError('An error occurred while fetching the listing details');
        } 
    };

    // Fetch comments for the listing
    const fetchComments = async () => {
        try {
            const response = await fetch(`/api/users/get-comments/${id}`);
            if (response.ok) {
                const data = await response.json();
                setComments(data); 
            } else {
                setError('Failed to fetch comments');
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    useEffect(() => {
        fetchListingDetails();
        fetchComments(); 
    }, [id]);

    const handleReturn = () => {
        navigate('/browse_listings');  
    };

    const handleCommentChange = (e) => {
        setComment(e.target.value);
    };

    const handleBid = (e) => {
        if (role === 'user') {
            navigate('');
        } else if (role === 'vip') {
            navigate('');
        }else if (role === 'superuser') {
            navigate('');
        }else if (role === 'visitor') {
            alert('Oops! Only users are allowed to access this feature, apply to be a user via your profile today to place a bid')
    }
    
        
    };

    const handleCommentSubmit = async () => {
        const token = localStorage.getItem('token'); 

        if (!comment.trim()) {
            alert('Please enter your comment');
            return;
        }

        try {
            const response = await fetch('/api/users/add-comment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, 
                },
                body: JSON.stringify({
                    listing_id: id,
                    comment: comment,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                alert('Comment uploaded!');
                setComment(''); 
                fetchComments(); 
            } else {
                alert('Error uploading comment, please try again.');
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        }
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
            <button className="bid-button" onClick={handleBid}> Place a Bid</button>
            <div class="vertical-line"></div>

            <div className="label-comments"> Comments:</div>
            <textarea
                className="add-comment"
                placeholder="Add your comment"
                maxLength="250"
                value={comment}
                onChange={handleCommentChange}
            />
            <div className="comment-section">
                {comments.length === 0 ? (
                    <p>Add the first comment...</p>
                ) : (
                    comments.map((comment, index) => (
                        <div key={index} className="comment-item">
                            <strong>{comment.commenter_id.username}:</strong> {comment.comment}
                            <br />
                            <span>{new Date(comment.date_added).toLocaleString()}</span>
                        </div>
                    ))
                )}
            </div>
            <div className="listing-btn-container">
                <button className="comment-button" onClick={handleCommentSubmit}> Submit Comment </button>
                <button onClick={handleReturn} className="listing-button">Return</button>
            </div>
        </div>
    );
};

export default Listing_clicked;

