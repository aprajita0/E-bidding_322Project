import React, { useState, useEffect } from 'react';
import './styles/user_profile.css';
import { useNavigate } from 'react-router-dom';
import '@fontsource/dm-sans/700.css'; 
import exchange_image from '../assets/exchange.png';
import profile_pic from '../assets/profile_pic.png';

const User_profile = () => {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [accountBalance, setAccountBalance] = useState(0);
    const [listingSelect, setListingSelect] = useState('');
    const [bidSelect, setBidSelect] = useState('');
    const [messages, setMessages] = useState([]);
    const [messageSelect, setMessageSelect] = useState('');
    const [messageInfo, setMessageInfo] = useState('');
    const [selectedMessage, setSelectedMessage] = useState('');
    const [username, setUsername] = useState('');
    const [userListings, setUserListings] = useState([]);

    const bids = [
        { id: 1, amount: 100, deadline: '2024-11-15' },
    ];

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

        const fetchMessages = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('User not authenticated.');
                    return;
                }
        
                const response = await fetch('/api/users/get-notif', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
        
                if (response.ok) {
                    const data = await response.json();
                    if (data.notifications && data.notifications.length > 0) {
                        setMessages(data.notifications);
                    } else {
                        setError('No notifications found.');
                    }
                } else {
                    setError(result.error || 'Cannot show messages');
                }
            } catch (err) {
                console.error('Error fetching notifications:', err);
                setError('Server error');
            }
        };
        

        fetchMessages();
        fetchBalance();
        fetchUserListings();
    }, []);

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

    const handleRead = () => {
        navigate('/');
    };

    const handleMessageSelect = (e) => {
        const selectedId = e.target.value;
        setMessageSelect(selectedId);
        const message = messages.find((msg) => msg.id === selectedId);
        setSelectedMessage(message ? message.notification_type : '');
        setMessageInfo(message ? message.notification : '');
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
                            <select className="show-listings" id="listing_select" value={listingSelect} onChange={(e) => setListingSelect(e.target.value)} required>
                                <option value="">Select a Listing</option>
                                {userListings.map((listing) => (
                                    <option key={listing._id} value={listing._id}>
                                        {listing.name}, Price Range: ${formatMin(listing.price_from)} - ${formatMax(listing.price_to)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="my-listings-container">
                            <div className="my-listings_label">Select a Bid:</div>
                            <select className="show-listings" id="bid_select" value={bidSelect} onChange={handleBidSelectChange} required>
                                <option value="">Select a Bid</option>
                                {bids.map((bid) => (
                                    <option key={bid.id} value={bid.id}>
                                        Amount Offered: ${bid.amount}, Deadline: {bid.deadline}
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
                        <img src={exchange_image} alt="my-listings-image" className="my-listings-image" />
                    </div>
                    <div className="functionality-box">
                        <div className="my-listings">My Inbox</div>
                        <div className="my-listings-container">
                            <div className="my-listings_label">New Messages:</div>
                            <select className="show-messages" id="message_select" value={messageSelect || ''} onChange={handleMessageSelect}required>
                                <option value="">Open a Message</option>
                                {messages.map((msg) => (
                                    <option key={msg.id} value={msg.id}>
                                        {msg.notification_type || 'No new messages'}
                                        </option>
                                ))}
                            </select>
                        </div>
                        {selectedMessage && (
                            <div className="show-messages">{selectedMessage}</div>
                        )}
                        {messageInfo ? (
                            <div className="message-info">{messageInfo}</div>
                        ) : (
                        <div className="message-info">
                            No message details available
                        </div>
                        )}
                        <div>
                            <button className="read" type="button" onClick={handleRead}>Read</button>
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
                </div>
                <div className="add-container">
                    <button className="add-button" onClick={() => navigate('/add_listings')}>+</button>
                </div>
            </section>
        </div>
    );
};

export default User_profile;


