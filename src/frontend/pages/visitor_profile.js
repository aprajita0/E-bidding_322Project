import React, { useState, useEffect } from 'react';
import './styles/visitor_profile.css';
import { useNavigate } from 'react-router-dom';
import '@fontsource/dm-sans/700.css'; 
import profile_pic from '../assets/profile_pic.png';

const VisitorProfile = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [answer, setAnswer] = useState(0);
    const [correctAnswer, setCorrectAnswer] = useState(null);
    const [question, setQuestion] = useState('');
    const [error, setError] = useState('');
    const [verified, setVerified] = useState(false); //state that tracks whether qA is true

    //function that generates a random math question (CAPTCHA)
    const generateQuestion = () => {
        const num1 = Math.floor(Math.random() * 10);
        const num2 = Math.floor(Math.random() * 10);
        setCorrectAnswer(num1 + num2);
        setQuestion(`${num1} + ${num2}`);
    };

    //function that sets verified as true if user answers correctly
    const verifyAnswer = () => {
        if (parseInt(answer, 10) === correctAnswer) {
            setVerified(true);
            setError('');
        } else {
            setError('Incorrect answer to the question.');
            setVerified(false);
        }
    }
    //two buttons, 1: answer question, user clicks button and sends answer to us, we check if it's right
    //if its right, second button that says "submit application"
    //as long as the user is logged in, the person should be able to apply for regular user 

    const applyToBeUser = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('Token:', token); //Logging the token for debugging

            if (!token) {
                alert('No token found, please log in again.');
                return;
            }

            const response = await fetch('/api/users/apply-reguser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ username })
            });
    
            const data = await response.json();
            console.log('Server response:', data); // Debugging line
    
            if (data.message.includes("Application for regular user submitted successfully")) {
                alert(`Application submitted for: ${username}. A Superuser will review your application.`);
            } else {
                alert('Failed to submit application');
            }
        } catch (err) {
            console.error('Error applying to be a user:', err);
            alert('Server error');
        }
    };
    
    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        setUsername(storedUsername || 'Guest');
        generateQuestion(); // Only called once when the component mounts
    }, []);


    return (
        <div className="profile-container">
            <section className="banner">
                <div className="top-profile">
                    <img src={profile_pic} alt="Profile" className="profile_image" />
                    <div className="welcome">Welcome, {username}</div>
                </div>
            </section>
            <section className="user-grid">
                <div className="user_profile-grid">
                    <div className="functionality-box">
                        <div className="my-listings">Apply to be a User</div>
                        <div className="my-listings-container">
                            <div className="my-listings_label">Solve to Apply: {question}</div>
                            <input
                                type="number"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                required
                            />
                            {error && <div className="error">{error}</div>}
                        </div>
                        <button className="apply-button" onClick={verifyAnswer}>Check if you're a Human</button>
                    </div>
                    {verified && ( //showing submit button on condition verified
                        <button className="apply-button" onClick={applyToBeUser}>Submit Application</button>
                    )}
                </div>
                <div className="functionality-box">
                    <div className="my-listings">Want to become a user?</div>
                    <div className="my-listings-container">
                        <div className="file-label">
                            Submit your application today to access full features and capabilities as a registered user!
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default VisitorProfile;
