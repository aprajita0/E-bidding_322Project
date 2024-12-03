import React, { useState, useEffect } from 'react';
import './styles/place_bid.css';
import { useParams, useNavigate } from 'react-router-dom';
import '@fontsource/dm-sans/700.css';

const Place_bid = () => {
    const {id} = useParams();
    console.log('Rendering Place_bid component');
    console.log('Listing ID:', id);
    
    const [bidAmount, setBidAmount] = useState('');
    const [deadline, setDeadline] = useState('');
    const [accountBalance, setAccountBalance] = useState(0);
    const [listing, setListing] = useState(null); 
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const token = localStorage.getItem('token');
                console.log('Token:', token);

                const response = await fetch('/api/users/get-balance', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                console.log('Response:', response);

                if (response.ok) {
                    const data = await response.json();
                    let balance = data.account_balance;

                    if (balance && typeof balance === 'object' && balance.$numberDecimal) {
                        balance = parseFloat(balance.$numberDecimal);
                    } else {
                        balance = parseFloat(balance) || 0;
                    }

                    setAccountBalance(balance);
                } else {
                    const result = await response.json();
                    console.error('Error fetching balance:', result);
                    setError(result.error || 'Cannot show balance');
                }
            } catch (err) {
                console.error('Error fetching balance:', err);
                setError('Server error');
            }
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

        if (id) {
            fetchBalance();
            fetchListingDetails();
        } else {
            setError('Invalid listing ID');
        }
    }, [id]);

    
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

    const handleBidSubmit = async (e) => {
        e.preventDefault();

        if (bidAmount > accountBalance) {
            setError('Insufficient funds to place this bid.');
            return;
        }

        const token = localStorage.getItem('token');
        const listing_id = id;
        const amount = bidAmount;
        const bid_expiration = deadline;

        console.log('Sending token:', token);
        console.log('Sending data:', { listing_id, amount, bid_expiration });

        const bidResponse = await fetch('/api/users/bid-listing', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ listing_id, amount, bid_expiration }),
        });

        if (bidResponse.ok) {
            navigate(`/browse_listings/${listing_id}`);
            alert("Your bid has been submitted.")
        } else {
            const bidData = await bidResponse.json();
            console.error('Bid error:', bidData);
            setError(bidData.error || 'Failed to place bid');
        }
    };

    return (
        <div className="bid-container">
            <div className="bid-listing-container">
                <div className="bid-box">
                    <h2 className="bid-sign">Place Your Bid</h2>
                    {error && <p className="error">{error}</p>}
                    <form onSubmit={handleBidSubmit}>
                        <div className="form-group">
<<<<<<< HEAD
                            <label className="bal-label" htmlFor="balance">Current Account Balance:</label>
                            <div className="acc-balance">${accountBalance}</div>
=======
                            <label className="balance-label" htmlFor="balance">Current Account Balance:</label>
                            <div className="account-balance">${accountBalance}</div>
>>>>>>> 98d38beb226dd8589d1a29c84f55ebdf8224ce36
                        </div>
                        <div className="form-group">
                            <label htmlFor="bidAmount">Bid Amount:</label>
                            <input
                                type="number"
                                id="bidAmount"
                                value={bidAmount}
                                onChange={(e) => setBidAmount(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="deadline">Deadline:</label>
                            <input
                                type="datetime-local"
                                id="deadline"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit">Place Bid</button>
                    </form>
                </div>
                {listing && (
                    <div className="listing-box">
                        <h2 className="bid-sign">Listing Details</h2>
                        <p><strong>Title:</strong>{listing.name}</p>
                        <p><strong>Description:</strong> {listing.description}</p>
                        <p><strong>Price Range: ${formatMin(listing.price_from)} - ${formatMax(listing.price_to)}</strong></p>
<<<<<<< HEAD
=======
                        {/* Add other listing details as needed */}
>>>>>>> 98d38beb226dd8589d1a29c84f55ebdf8224ce36
                    </div>
                )}
            </div>
        </div>
    );
};

export default Place_bid;
