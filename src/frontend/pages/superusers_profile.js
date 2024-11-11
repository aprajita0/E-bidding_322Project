import React, { useState, useEffect } from 'react';
import './styles/superusers_profile.css';
import { useNavigate } from 'react-router-dom';
import '@fontsource/dm-sans/700.css'; 
import profile_pic from '../assets/profile_pic.png';

const Superusers_profile = () => {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [accountBalance, setAccountBalance] = useState(0);
    const [listingSelect, setListingSelect] = useState(''); 
    const [bidSelect, setBidSelect] = useState('');
    const [messageSelect, setMessageSelect] = useState(''); 
    const [selectedMessage, setSelectedMessage] = useState(''); 
    const [username, setUsername] = useState('');

    const handleAccept = () => {
        navigate('/');
    };

    const handleDeny = () => {
        navigate('/');
    };

    const handleRead = () => {
        navigate('/');
    };

    const handleAcceptApp = () => {
        navigate('/');
    };

    const handleDenyApp = () => {
        navigate('/');
    };

    const handleUnsuspend = () => {
        navigate('/');
    };


    const bids = [
        { id: 1, amount: 100, deadline: '2024-11-15' },
        { id: 2, amount: 200, deadline: '2024-11-20' },
        { id: 3, amount: 150, deadline: '2024-11-18' },
    ];

    const messages = [
        { id: 1, content: 'Message about a selling offer.' },
        { id: 2, content: 'Message about renting an item.' },
        { id: 3, content: 'Message about a buying request.' },
    ];

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

        fetchBalance();
    }, []); 

    const handleBidSelectChange = (e) => {
        const selectedBidId = parseInt(e.target.value);
        const selectedBid = bids.find(bid => bid.id === selectedBidId);
        setBidSelect(selectedBidId);
    };

    const handleMessageSelect = (e) => {
        const selectedMessageId = parseInt(e.target.value);
        setMessageSelect(selectedMessageId);

        const selectedMsg = messages.find(msg => msg.id === selectedMessageId);
        setSelectedMessage(selectedMsg ? selectedMsg.content : ''); 
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
                <img src={profile_pic} alt="Image" className ="profile_image" />
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
                        <option value="selling">Selling</option>
                        <option value="renting">Renting</option>
                        <option value="buying">Buying</option>
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
                <div className="my-listings">Suspended Accounts:</div>
                <div className="my-listings-container">
                    <div className="my-listings_label">Suspensions:</div>
                    <select className="show-listings" id="listing_select" value={listingSelect} onChange={(e) => setListingSelect(e.target.value)} required>
                        <option value="">Select suspended accounts</option>
                        <option value="selling">Appy1</option>
                        <option value="renting">App2</option>
                        <option value="buying">App3</option>
                    </select>
                </div>
                <div className="my-listings-container">
                    <div className="my-listings_label">Account Details:</div>
                    <select className="show-listings" id="listing_select" value={listingSelect} onChange={(e) => setListingSelect(e.target.value)} required>
                        <option value="">Account Details</option>
                        <option value="selling">Appy1</option>
                        <option value="renting">App2</option>
                        <option value="buying">App3</option>
                    </select>
                </div>
                <div>
                    <button className="read" type="button" onClick={handleUnsuspend}> Unsuspend</button>
                </div>
                </div>
              <div className="functionality-box">
                <div className="my-listings">My Inbox</div>
                <div className="my-listings-container">
                    <div className="my-listings_label">New Messages:</div>
                    <select className="show-messages" id="message_select" value={messageSelect} onChange={handleMessageSelect} required>
                        <option value="">Open a Message</option>
                        {messages.map((msg) => (
                            <option key={msg.id} value={msg.id}>
                                {msg.content}
                            </option>
                        ))}
                    </select>
                </div>
                {selectedMessage && (
                    <div className="message-info"> {selectedMessage}</div>
                )}
                <div>
                    <button className="read" type="button" onClick={handleRead}>Read</button>
                </div>
              </div>
              <div className="functionality-box">
                <div className="my-listings">Approve/Deny User Applications</div>
                <div className="my-listings-container">
                    <div className="my-listings_label">Pending:</div>
                    <select className="show-listings" id="listing_select" value={listingSelect} onChange={(e) => setListingSelect(e.target.value)} required>
                        <option value="">Select an Application</option>
                        <option value="selling">Appy1</option>
                        <option value="renting">App2</option>
                        <option value="buying">App3</option>
                    </select>
                </div>
                <div className="my-listings-container">
                    <div className="my-listings_label">Account Details:</div>
                    <select className="show-listings" id="listing_select" value={listingSelect} onChange={(e) => setListingSelect(e.target.value)} required>
                        <option value="">Select an Application</option>
                        <option value="selling">Appy1</option>
                        <option value="renting">App2</option>
                        <option value="buying">App3</option>
                    </select>
                </div>
                <div>
                    <button className="accept-bid" type="button" onClick={handleAcceptApp}>Accept</button>
                    <button className="deny-bid" type="button" onClick={handleDenyApp}>Deny</button>
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

export default Superusers_profile;