import React, { useState, useEffect } from 'react';
import './styles/visitor_profile.css';
import { useNavigate } from 'react-router-dom';
import '@fontsource/dm-sans/700.css'; 
import profile_pic from '../assets/profile_pic.png';

const visitor_profile = () => {
    const [isHuman, setIsHuman] = useState(false);
    const [applicationStatus, setApplicationStatus] = useState('');
    const [arithmeticQuestion, setArithmeticQuestion] = useState({ question: '', answer: '' });
    const [error, setError] = useState('');

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
            
            {/*application to become a user*/}
            <div classname="application-container">
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

