import React, { useState, useEffect } from 'react';
import './styles/visitor_profile.css';
import { useNavigate } from 'react-router-dom';
import '@fontsource/dm-sans/700.css'; 
import profile_pic from '../assets/profile_pic.png';

const visitor_profile = () => {
    const [listings, setListings] = useState([]);
    const [comment, setComment] = useState('');
    const [isHuman, setIsHuman] = useState(false);
    const [applicationStatus, setApplicationStatus] = useState('');
    const [arithmeticQuestion, setArithmeticQuestion] = useState({ question: '', answer: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const response = await fetch('/api/listings', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
        
                if (response.ok) {
                    const data = await response.json();
                    setListings(data); 
                } else {
                    console.error('Failed to fetch listings');
                }
            } catch (err) {
                console.error('Error fetching listings:', err);
            }
        };
        fetchListings();
    }, []);

    const handleCommentSubmit = async (listingId) => {
        try {
            const response = await fetch(`/api/listings/${listingId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ comment }),
            });
            if (response.ok) {
                alert('Comment added!');
            } else {
                console.error('Failed to add comment');
            }
        } catch (error) {
            console.error('Error submitting comment:', error);
        }
    };

    const generateQuestion = () => {
        const num1 = Math.floor(Math.random() * 10);
        const num2 = Math.floor(Math.random() * 10);
        setArithmeticQuestion({ question: `${num1} + ${num2}`, answer: num1 + num2 });
    };
    
    const verifyAnswer = (userAnswer) => {
        setIsHuman(parseInt(userAnswer) === arithmeticQuestion.answer);
    };
    
    const handleApplicationSubmit = async () => {
        if (isHuman) {
            try {
                const response = await fetch('/api/apply', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({}),
                });
                if (response.ok) {
                    setApplicationStatus('Application submitted!');
                } else {
                    setApplicationStatus('Failed to submit application');
                }
            } catch (error) {
                console.error('Error submitting application:', error);
            }
        } else {
            setApplicationStatus('Please answer the question correctly to proceed.');
        }
    };

    return (
        <div classname="profile-container">
            <section classname="banner"> {/* name and profile pic*/}
                <div classname="top-profile">
                    <img src={profile_pic} alt="Profile" classname="profile_image" />
                    <div classname="welcome">Welcome, visitor</div>
                </div>
            </section>
            
            {/*Browsing listings from profile*/}
            <div className="profile-listings-container">
                {userListings.map((listing) => (
                    <div key={listing.id} className="listing">
                        <h3>{listing.title}</h3>
                        <p>{listing.description}</p>
                        
                        {/*comment section*/}
                        <textarea
                            placeholder="Add a comment..."
                            onChange={(e) => setComment(e.target.value)}
                        />
                        <button onClick={() => handleCommentSubmit(listing.id)}>
                            Submit Comment
                        </button>
                    </div>
                ))}   
            </div>
            
            {/*application to become a user*/}
            <div className="application-container">
                <button onClick={generateQuestion}>Start Application</button>
                {arithmeticQuestion.question && (
                    <div>
                        <label>{arithmeticQuestion.question}</label>
                        <input
                            type="number"
                            onChange={(e) => verifyAnswer(e.target.value)}
                            placeholder="Your Answer"
                        />
                    </div>
                )}

                <button onClick={handleApplicationSubmit}>
                    Apply to Become a User
                </button>
                <p>{applicationStatus}</p>
            </div>
        
        </div>  
    );
    
  
};

export default visitor_profile;
