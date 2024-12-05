import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '@fontsource/dm-sans'; 
import './styles/complaint_form.css'; 

const Complaint_form = () => {
    const [transactions, setTransactions] = useState([]);
    const [complaintDescription, setComplaintDescription] = useState('');
    const [selectedTransaction, setSelectedTransaction] = useState(''); 
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const role = localStorage.getItem('role');

    const handleComplaint = async (event) => {
        event.preventDefault();
        if (!selectedTransaction) {
            alert('Please select a transaction.');
        }
        const formData = {
            complainer_id: localStorage.getItem('user_id'),
            subject_id: selectedTransaction,
            description: complaintDescription,
        };

        try {
            const response = await fetch('/api/users/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                alert('Your complaint has been submitted!');
                if (data.role === 'reguser') {
                    navigate('/user_profile');
                } else if (data.role === 'superuser') {
                    navigate('/superusers_profile');
                }
            } else {
                alert(`Server error, failed to submit complaint`);
            }
        } catch (error) {
            alert('Error submitting complaint');
        }
    };
    
    const handleReturn = () => {
        if (role === 'reguser') {
            navigate('/user_profile');
        } else if (role === 'superuser') {
            navigate('/superusers_profile');
        }
    };
    
    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }
                const response = await fetch('/api/users/get-transactions', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`, 
                    },
                });
    
                const data = await response.json(); 
                if (response.ok) {
                    setTransactions(data); 
                } else {
                    console.error('Failed to fetch transactions:', data);
                    setError(data.message || 'Error fetching transactions');
                }
            } catch (err) {
                console.error('Error fetching transactions:', err);
                setError('Error fetching transactions');
            }
        };

        fetchTransactions();
    }, [navigate]);
    
    return (
        <div className="complaint-container">
            <div className="complaint-box">
                <h2 className="complaint-sign">File a Complaint</h2>
                {error && <p className="error-message">{error}</p>}
                <label className="complaint-blurb" htmlFor="blurb">
                    We want to extend our deepest apologies for any 
                    inconvenience you may have encountered while using our services. Please know that we are committed to 
                    addressing all issues promptly and ensuring that your experience with us improves moving forward. Please
                    enter your formal complaint below to be reviewed by a member of our committed. Once your complaint has
                    been reviewed you will receive a follow-up message on your account. Thank you for your time and patience.
                </label>
                <form className="complaint-form" onSubmit={handleComplaint}>
                    <div className="form_container"> 
                        <label className="complaint-label" htmlFor="complaint_item">
                            Select an Item/Service Purchased or Rented
                        </label>
                        <select className="complaint-input" id="item_complaining" value={selectedTransaction} onChange={(e) => setSelectedTransaction(e.target.value)} required>
                            <option value="">Select an Item/Service</option>{transactions.map((transaction) => {
                                const name = transaction.listing_id?.name || 'N/A';
                                return (
                                    <option key={transaction._id} value={transaction._id}>
                                        {name} 
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                    <div className="form_container"> 
                        <label className="complaint-label" htmlFor="description">
                            Please describe in detail your complaint
                        </label>
                        <textarea 
                            className="complaint-description" 
                            id="complaint-details" 
                            placeholder="Enter the details for the complaint" 
                            rows="4" 
                            value={complaintDescription} 
                            onChange={(e) => setComplaintDescription(e.target.value)}  
                            required
                        ></textarea>
                    </div>
                    <div>
                        <button className="return-profile" type="button" onClick={handleReturn}>Return</button>
                        <button className="complaint-finish" type="submit">Submit</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Complaint_form;
