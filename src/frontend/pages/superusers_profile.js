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
    const [bids, setBids] = useState([]);
    const [username, setUsername] = useState('');
    const [userListings, setUserListings] = useState([]);
    const [visitorSelect, setVisitorSelect] = useState(''); 
    const [applications, setApplications] = useState([]);
    const [suspendedUserSelect, setSuspendedUserSelect] = useState('');
    const [suspendedUsers, setSuspendedUsers] = useState([]);

    const handleAccept = () => {
        navigate('/');
    };

    const handleDeny = () => {
        navigate('/');
    };

    const handleAcceptApp = async () => {
        if (!visitorSelect) {
            alert('Please select an application');
            return;
        }
    
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/users/approve-reguser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ visitor_id: visitorSelect }),
            });
    
            const data = await response.json();
            if (response.ok) {
                alert('Application approved!');
                setApplications((prev) => prev.filter((user) => user.user_id !== visitorSelect));
                setVisitorSelect('');
                setError('');
            } else {
                console.error('Approval failed:', data.error || 'Unknown error');
                setError(data.error || 'Failed to approve application.');
            }
        } catch (err) {
            console.error('Error during API call:', err);
            setError('Server error');
        }
    };
    const handleVisitorSelect = (e) => {
        setVisitorSelect(e.target.value);
    };

    const handleDenyApp = async () => {
        if (!visitorSelect) {
            alert('Please select an application');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/users/deny-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ user_id: visitorSelect }),
            });
    
            const data = await response.json();
            if (response.ok) {
                alert('Application denied');
                setApplications((prev) => prev.filter((user) => user.user_id !== visitorSelect));
                setVisitorSelect('');
                setError('');
            } else {
                console.error('Denial failed:', data.error || 'Unknown error');
                setError(data.error || 'Failed to deny application.');
            }
        } catch (err) {
            console.error('Error during API call:', err);
            setError('Server error');
        }
    };

    const handleUnsuspend = async (e) => {
        e.preventDefault();

    if (!suspendedUserSelect) {
        setError('Please select a user to unsuspend.');
        return;
    }

    try {
        const token = localStorage.getItem('token'); 
        const response = await fetch('/api/users/unsuspend-account', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`, 
            },
            body: JSON.stringify({
                user_id: suspendedUserSelect, 
            }),
        });

        if (response.ok) {
            const result = await response.json();
            alert(result.message || 'User unsuspended!');
            setSuspendedUsers((prev) =>prev.filter((user) => user.user_id !== suspendedUserSelect)); 
            setSuspendedUserSelect(''); 
        } else {
            const result = await response.json();
            setError(result.error || 'Error unsuspending user.');
        }
    } catch (err) {
        console.error('Error unsuspending account:', err);
        setError('Server error. Please try again later.');
    }
    };

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
                setError('Server error');
            }
        };

        const fetchApplications = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/users/get-visitor-applications', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });
    
                const data = await response.json();
                console.log('Applications fetched:', data);
    
                if (response.ok) {
                    setApplications(data);
                } else {
                    console.error('Failed to fetch applications:', data.error || 'N/A');
                    setError(data.error || 'Failed to fetch applications');
                }
            } catch (err) {
                console.error('Error fetching visitor applications', err);
                setError('Server error');
            }
        };

        const fetchSuspensions = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/users/get-suspended-account', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });
    
                const data = await response.json();
                console.log('Suspended accounts fetched:', data);
    
                if (response.ok) {
                    setSuspendedUsers(data); 
                } else {
                    console.error('Failed to fetch suspended users', data.error || 'N/A');
                    setError(data.error || 'Failed to fetch suspended users');
                }
            } catch (err) {
                console.error('Error fetching suspended users', err);
                setError('Server error');
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
        fetchSuspensions();
        fetchApplications();
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
                <div className="my-listings">Suspended Accounts:</div>
                <div className="my-listings-container">
                    <div className="my-listings_label">Suspensions:</div>
                    <select
                    className="show-listings"
                    id="suspended_user_select"
                    value={suspendedUserSelect}
                    onChange={(e) => setSuspendedUserSelect(e.target.value)}required>
                        <option value="">Select a Suspended Account</option>
                        {suspendedUsers.map((user) => (
                            <option key={user.user_id} value={user.user_id}>
                                {user.username}, Previous Suspensions: {user.suspension_count || 0}
                                </option>
                            ))}
                    </select>
                </div>
                <div>
                    <button className="read" type="button" onClick={handleUnsuspend}> Unsuspend</button>
                </div>
                </div>
                <div className="functionality-box">
                <div className="my-listings">Review Complaints</div>
                <div className="my-listings-container">
                    <div className="my-listings_label">Pending:</div>
                    <select className="show-listings" id="listing_select"  required>
                        <option value="">Select a Complaint</option>
                        <option value="selling">Comp1</option>
                    </select>
                </div>
                <div className="my-listings-container">
                    <div className="my-listings_label">Complaint Details:</div>
                    <select className="show-listings" id="listing_select" required>
                        <option value="">Complaint Details</option>
                        <option value="selling">Appy1</option>
                    </select>
                </div>
                <div>
                    <button className="read" type="button" >Resolve</button>
                </div>
            </div>
              <div className="functionality-box">
                <div className="my-listings">Approve/Deny User Applications</div>
                <div className="my-listings-container">
                <div className="my-listings_label">Pending:</div>
                <select className="show-listings"id="visitor_select" value={visitorSelect} onChange={handleVisitorSelect}>
                    <option value="">Select an Application</option>
                    {applications.map((app) => (
                        <option key={app.id} value={app.user_id?._id}> 
                        {app.user_id?.username || 'N/A'}, {app.user_id?.email || 'N/A'}
                    </option>
                    ))}
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


