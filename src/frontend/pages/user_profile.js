import React, { useState, useEffect } from 'react';
import './styles/user_profile.css';
import { useNavigate } from 'react-router-dom';
import BuyerRatings from '../components/buyer_ratings.js';
import RatingModal from '../components/rating_modal.js';
import '@fontsource/dm-sans/700.css'; 
import exchange_image from '../assets/exchange.png';
import profile_pic from '../assets/profile_pic.png';
import message_pic from '../assets/message.png';

const User_profile = () => {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [accountBalance, setAccountBalance] = useState(0);
    const [listingSelect, setListingSelect] = useState('');
    const [bidSelect, setBidSelect] = useState('');
    const [bids, setBids] = useState([]);
    const [username, setUsername] = useState('');
    const [userListings, setUserListings] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [transactionId, setTransactionId] = useState(null);


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
        const fetchBalance = async () => {
            try {
                const token = localStorage.getItem('token');
                const username = localStorage.getItem('username');
                setUsername(username);
                const response = await fetch('/api/users/get-balance', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
    
                if (response.ok) {
                    const data = await response.json();
                    const balance = data.account_balance;
                    if (balance && typeof balance === 'object' && balance.$numberDecimal) {
                        setAccountBalance(parseFloat(balance.$numberDecimal));
                    } else {
                        setAccountBalance(balance);
                    }
                } else {
                    const result = await response.json();
                    setError(result.error || 'Cannot show balance');
                }
            } catch (err) {
                console.error('Error fetching balance:', err);
                setError('Server error');
            }
        };
    
        const fetchUserListings = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/users/get-user-listings', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
    
                if (response.ok) {
                    const data = await response.json();
                    setUserListings(data);
                } else {
                    console.error('Failed to fetch your listings');
                }
            } catch (err) {
                console.error('Error fetching your listings:', err);
            }
        };
    
        fetchBalance();
        fetchUserListings();
    }, []);
    
    useEffect(() => {
        const fetchBids = async (listingId) => {
            try {
                if (!listingId) {
                    console.error('Listing ID is required to fetch bids.');
                    return;
                }
    
                const token = localStorage.getItem('token');
                const response = await fetch('/api/users/get-bids', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ listing_id: listingId }), 
                });
    
                if (response.ok) {
                    const data = await response.json();
                    console.log('Fetched Bids:', data.bids); 
                    setBids(data.bids || []); // bids is an array
                } else {
                    const errorData = await response.json();
                    console.error('Failed to fetch bids:', errorData.error);
                    setBids([]); 
                }
            } catch (err) {
                console.error('Error fetching bids:', err.message);
                setError('Error fetching bids.');
                setBids([]); 
            }
        };
    
        // call fetchBids w/the current listingSelect value
        if (listingSelect) {
            fetchBids(listingSelect);
        }
    }, [listingSelect]); // trigger whenever listingSelect changes
    
    const handleBidSelectChange = (e) => {
        const selectedBidId = e.target.value;
        console.log('Selected Bid ID:', selectedBidId);

        const selectedBid = bids.find(bid => bid._id === selectedBidId);
        if (selectedBid) {
            setBidSelect(selectedBidId);
        } else {
            console.error('Selected bid not found in the bids list');
        }
    };

    const handleAccept = async () => {
        if (!bidSelect || !listingSelect) {
            alert('Please select both a bid and a listing first.');
            return;
        }
    
        const selectedBid = bids.find(bid => bid._id === bidSelect); // Match the selected bid
        if (!selectedBid) {
            alert('Invalid bid selected.');
            return;
        }
    
        console.log('Selected Bid ID:', bidSelect);
        console.log('Selected Listing ID:', listingSelect);
    
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/users/accept-bid', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    bid_id: bidSelect, //mongoDB _id of the bid
                    listing_id: listingSelect, 
                }),
            });
    
            if (response.ok) {
                const data = await response.json();
                console.log('Bid accepted successfully:', data);
                alert('Bid accepted successfully!');
                const transactionId = data.transaction._id;
                setTransactionId(transactionId);
                setIsModalOpen(true);

                const updatedListings = userListings.filter(listing => listing._id !== listingSelect);
                setUserListings(updatedListings);
                setBidSelect('');
                setListingSelect('');
                setBids([]);
            } else {
                const error = await response.json();
                console.error('Error accepting bid:', error.error);
                alert(error.error || 'Error accepting bid.');
            }
        } catch (err) {
            console.error('Error accepting bid:', err.message);
            alert('Server error while accepting bid.');
        }
    };
    

    const handleDeny = async () => {
        if (!bidSelect) {
            alert('Please select a bid to deny.');
            return;
        }

        const selectedBid = bids.find(bid => bid._id === bidSelect); // match the selected bid
        if (!selectedBid) {
            alert('The bid you selected is no longer valid.');
            setBidSelect('');
            return;
        }
    
        console.log('Selected Bid ID to deny:', bidSelect);
    
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/users/deny-bid', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ bid_id: bidSelect }), // send the selected bid's _id
            });
    
            if (response.ok) {
                const data = await response.json();
                console.log('Bid denied successfully:', data);
                alert('Bid denied successfully!');
                // Remove the denied bid from the state
                const updatedBids = bids.filter(bid => bid._id !== bidSelect);
                setBids(updatedBids);
                setBidSelect(''); // Reset bid selection
            } else {
                const error = await response.json();
                console.error('Error denying bid:', error.error);
                alert(error.error || 'Error denying bid.');
            }
        } catch (err) {
            console.error('Error denying bid:', err.message);
            alert('Server error while denying bid.');
        }
    };
    
    const handleRequestDeletion = async (e) => {
        e.preventDefault();
    };

    return (
        <div className="profile-container">
            <div className="balance-container">
                <label className="profile-balance" htmlFor="profile-balance">Account Balance: </label>
                <div className="show-balance">${accountBalance}</div>
                <button className="balance-button" onClick={() => navigate('/balance_menu')}>Manage Account Balance</button>
            </div>
            <section className="banner">
                <div className="top-profile">
                    <img src={profile_pic} alt="Profile" className="profile_image" />
                    <div className="welcome">Welcome, {username}</div>
                </div>
            </section>
            <section className="user-grid">
                <div className="user_profile-grid">
                    <div className="functionality-box">
                        <div className="my-listings">My Current Listings</div>
                        <div className="my-listings-container">
                            <div className="my-listings_label">Select a Listing:</div>
                            <select className="show-listings"id="listing_select" value={listingSelect} onChange={(e) => setListingSelect(e.target.value)} required>
                                <option value="">Select a Listing</option>
                                {userListings.map((listing) => (
                                    <option key={listing._id} value={listing._id}>
                                        {listing.name}, Price Range: ${formatMin(listing.price_from)} - ${formatMax(listing.price_to)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="my-listings-container"><div className="my-listings_label">Select a Bid:</div>
                        <select className="show-listings" id="bid_select" value={bidSelect} onChange={handleBidSelectChange}required>
                            <option value="">Select a Bid</option>
                            {bids.map((bid) => (
                                <option key={bid._id} value={bid._id}>
                                    Amount Offered: ${bid.amount.$numberDecimal || bid.amount}, Deadline: {bid.bid_expiration || 'No deadline'}
                                </option>
                            ))}
                        </select>
                        </div>
                        <div>
                            <button className="accept-bid" type="button" onClick={handleAccept}>Accept</button>
                            <button className="deny-bid" type="button" onClick={handleDeny}>Deny</button>
                        </div>
                    </div>
                    <div className="functionality-box">
                        <div className="my-listings">Want to Delete Your Account?</div>
                        <div className="my-listings-container">
                            <div className="file-label">
                                We’re sorry to see you go! Please note that account deletion is permanent and cannot be 
                                undone. If you have any questions or need assistance, feel free to reach out before 
                                proceeding.
                            </div>
                        </div>
                        <div>
                            <button className="access-file" type="button" onClick={handleRequestDeletion}> Request Deletion</button>
                        </div>
                    </div>
                    <div className="functionality-box">
                        <div className="my-listings">Dissatisfied with an Item You Bidded On?</div>
                        <div className="my-listings-container">
                            <div className="file-label">
                                At TrustSphere, we deeply value our customers and are committed to ensuring your satisfaction with every experience.
                                If you're not completely happy with your purchase, we want to make it right. Please let us know how we can help by submitting
                                a complaint form today, and our team will work diligently to address your concerns and rectify the situation. Your trust is
                                our priority, and we’re here to support you.
                            </div>
                        </div>
                        <button className="access-file" onClick={() => navigate('/Complaint')}>File a Complaint</button>
                    </div>
                    <div className="functionality-box">
                        <img src={message_pic} alt="my-listings-image" className="my-listings-image" />
                    </div>
                </div>
                <div className="add-container">
                    <button className="add-button" onClick={() => navigate('/add_listings')}>+</button>
                </div>
                    <div className="functionality-box">
                            <p>Below are your transactions that need a rating:</p>
                            <BuyerRatings />
                    </div>
            </section>
            <RatingModal
            open={isModalOpen}
            handleClose={() => setIsModalOpen(false)}
            transactionId={transactionId}
            onSuccess={() => {
                setIsModalOpen(false);
            }}
            />
        </div>
    );
};

export default User_profile;

