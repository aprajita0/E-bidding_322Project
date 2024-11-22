import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '@fontsource/dm-sans'; 
import './styles/complaint_form.css'; 


const Complaint_form = () => {
    const navigate = useNavigate();
    const role = localStorage.getItem('role');
    const handleSubmit = () => {
        navigate();
    };

    const handleReturn = () => {
        if (role === 'reguser') {
            navigate('/user_profile')
        } else if (role === 'superuser') {
            navigate('/superusers_profile');
        }
    };

    const [item, setItem] = useState(''); 

    return (
        <div className="complaint-container">
            <div className="complaint-box">
                <h2 className="complaint-sign">File a Complaint</h2>
                <label className="complaint-blurb" htmlFor="blurb"> We want to extend our deepest apologies for any 
                    inconvenience you may have encountered while using our services. Please know that we are committed to 
                    addressing all issues promptly and ensuring that your experience with us improves moving forward. Please
                    enter your formal complaint below to be reviewed by a member of our committed. Once your complaint has
                    been reviewed you will recieve a follow up message on your account. Thank you for your time and patience. </label>
                <form className="complaint-form">
                    <div className="form_container"> 
                        <label className="complaint-label" htmlFor="complaint_item">Select an Item/Service Purchased or Rented </label>
                        <select className="complaint-input" id="item_type" value={item} onChange={(e) => setItem(e.target.value)} required>
                            <option value="">Select an Item/Service</option>
                            <option value="selling">Selling</option>
                            <option value="renting">Renting</option>
                            <option value="buying">Buying</option>
                        </select>
                    </div>
                    <div className="form_container"> 
                        <label className="complaint-label" htmlFor="description">Please describe in detail your complaint</label>
                        <textarea 
                        className="complaint-description" id="complaint-details" placeholder="Enter the details for the complaint" requiredrows="4"></textarea>
                        </div>
                    <div>
                        <button className="return-profile" type="button" onClick={handleReturn}>Return</button>
                        <button className="complaint-finish"  type="submit" onClick={handleSubmit}>Submit</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Complaint_form;


