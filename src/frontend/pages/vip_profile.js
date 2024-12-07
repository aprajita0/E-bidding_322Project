import React, { useState, useEffect } from 'react';
import './styles/vip_profile.css';
import { useNavigate } from 'react-router-dom';
import '@fontsource/dm-sans/700.css'; 
import exchange_image from '../assets/exchange.png';
import profile_pic from '../assets/profile_pic.png';

const Vip_profile = () => {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [accountBalance, setAccountBalance] = useState(0);
    const [listingSelect, setListingSelect] = useState('');
    const [bidSelect, setBidSelect] = useState('');
    const [bids, setBids] = useState([]);
    const [username, setUsername] = useState('');
    const [userListings, setUserListings] = useState([]);

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
        const fetchBids = async () => {
            try {
                if (!listingSelect) {
                    console.error('Listing ID needed');
                    return;
                }
                const token = localStorage.getItem('token');
                const response = await fetch('/api/users/get-bids', {
                    method: 'POST', 
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ listing_id: listingSelect }), 
                });
    
                if (response.ok) {
                    const data = await response.json();
                    setBids(data.bids);
                } else {
                    console.error('Failed to fetch bids');
                }
            } catch (err) {
                console.error('Error fetching bids:', err);
                setError('Error fetching bids.');
            }
        };
    
        fetchBids();
    }, [listingSelect]); 

    const handleBidSelectChange = (e) => {
        const selectedBidId = parseInt(e.target.value);
        const selectedBid = bids.find(bid => bid.id === selectedBidId);
        setBidSelect(selectedBidId);
    };

    const handleAccept = () => {
        navigate('/');
    };

    const handleDeny = () => {
        navigate('/');
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
                    <div className="welcome">Congratulations {username}, you are now a VIP!</div>
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
                            {bids.map((bid, index) => (
                                <option key={index} value={index}>
                                    Amount Offered: ${bid.amount && typeof bid.amount === 'object' && bid.amount.$numberDecimal? parseFloat(bid.amount.$numberDecimal).toFixed(2): bid.amount}, Deadline: {bid.bid_expiration || "No deadline"}
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
                        <div className="my-listings">Looking to give back to your fellow bidders?</div>
                        <div className="my-listings-container">
                            <div className="file-label">
                                Create a raffle today! Any bidder who places a bid on one of your items will automatically 
                                be entered. This not only increases publicity for VIP items but also rewards your bidders 
                                for their continued support. Start your raffle now and make every bid count!"
                            </div>
                        </div>
                        <button className="access-file" onClick={() => navigate('/Create_raffle')}>Create a Raffle</button>
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
                </div>
                <div className="add-container">
                    <button className="add-button" onClick={() => navigate('/add_listings')}>+</button>
                </div>
            </section>
        </div>
    );
};

export default Vip_profile;
