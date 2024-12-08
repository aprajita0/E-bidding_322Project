import React, { useState, useEffect } from 'react';
import './styles/superusers_profile.css';
import { useNavigate } from 'react-router-dom';
import '@fontsource/dm-sans/700.css'; 
import profile_pic from '../assets/profile_pic.png';
import message_pic from '../assets/message.png';

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
    const [complaints, setComplaints] = useState([]); 
    const [selectedComplaint, setSelectedComplaint] = useState(''); 
    const [formattedComplaints, setFormattedComplaints] = useState({});
    const [complaintDetails, setComplaintDetails] = useState('');
    const [deletionUserSelect, setDeletionUserSelect] = useState('');

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

    const fetchListingName = async (listingId) => {
        try {
            const response = await fetch(`api/users/get-listing/${listingId}`);
            if (response.ok) {
                const data = await response.json();
                return data.name || 'N/A';
            } else {
                console.error(`Failed to fetch listing name `);
            }
        } catch (err) {
            console.error(`Error fetching listing name:`, err);
        }
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

        const fetchComplaints = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/users/get-complaint?complaint_status=Pending', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });
    
                if (response.ok) {
                    const data = await response.json();
                    setComplaints(data);

                    const formatted = {};
                    for (const complaint of data) {
                        formatted[complaint._id] = await formatComplaint(complaint);
                    }
                    setFormattedComplaints(formatted);
                } else {
                    console.error('Failed to fetch complaints');
                }
            } catch (err) {
                console.error('Error fetching complaints:', err);
            }
        };
        fetchComplaints();
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
        const selectedBidId = e.target.value;
        console.log('Selected Bid ID:', selectedBidId);

        const selectedBid = bids.find(bid => bid._id === selectedBidId);
        if (selectedBid) {
            setBidSelect(selectedBidId);
        } else {
            console.error('Selected bid not found in the bids list');
        }
    };
    
    //accepting bids
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
                // Update the UI
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

    //denying bids
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

    const formatComplaint = async (complaint) => {
        const subject = complaint.subject_id;
        if (!subject || !subject.listing_id){
            return 'N/A'
        };
        
        const listingId = subject.listing_id;
        const name = await fetchListingName(listingId);
        const date = new Date(subject.transaction_date).toLocaleDateString();
        return `${name}, Transaction Date: ${date}`;
    };
    
    const handleComplaintSelect = (e) => {
        const selectedId = e.target.value;
        setSelectedComplaint(selectedId);

        const selected = complaints.find((complaint) => complaint._id === selectedId);
        if (selected) {
            setComplaintDetails(
                `Description: ${selected.description || 'No description given'}\n`
            );
        } else {
            setComplaintDetails('No details available');
        }
    };

    const handleResolve = async (e) => {
        e.preventDefault();
        if (!selectedComplaint) {
            setError('Please select a complaint');
            return;
        }

        try {
            const token = localStorage.getItem('token'); 
            const response = await fetch('/api/users/resolve-complaint', {
                
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`, 
                },
                body: JSON.stringify({
                    complaint_id: selectedComplaint, 
                }),
            });
            
            if (response.ok) {
                const result = await response.json();
                alert(result.message || 'Complaint resolved!');
                setComplaints((prev) => prev.filter((complaint) => complaint._id !== selectedComplaint)); 
                setSelectedComplaint('');
                setComplaintDetails('');
            } else {
                const result = await response.json();
                setError(result.error || 'Error resolving');
            }
        } catch (err) {
            console.error('Error resolving:', err);
            setError('Server error. Please try again later.');
        }
    };

    const handleDelete = async (e) => {
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
                        <div className="my-listings_label">Pending Complaints:</div>
                        <select className="show-listings" id="complaint_select" value={selectedComplaint} onChange={handleComplaintSelect}>
                            <option value="">Select a Complaint</option>
                            {complaints.map((complaint) => (
                                <option key={complaint._id} value={complaint._id}>
                                     {formattedComplaints[complaint._id] || 'N/A'}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="my-listings-container">
                        <div className="my-listings_label">Complaint Details:</div>
                        <textarea id="complaint_details" value={complaintDetails} style={{ width: '310px', height: '100px' }} readOnly/>
                    </div>
                    <div>
                        <button className="read" type="button" onClick={handleResolve} >Resolve</button>
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
            <div className="functionality-box">
                <div className="my-listings">Account Deletion Requests:</div>
                <div className="my-listings-container">
                    <div className="my-listings_label">Pending:</div>
                    <select className="show-listings" id="deletion_request_select" value={deletionUserSelect} onChange={(e) => setDeletionSelect(e.target.value)}required>
                        <option value="">Select an Account</option>
                    </select>
                    </div>
                <div>
                    <button className="read" type="button" onClick={handleDelete}> Approve Deletion</button>
                </div>
            </div>
            <div className="functionality-box">
                <img src={message_pic} alt="my-listings-image" className="my-listings-image" />
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
