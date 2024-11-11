* {
    box-sizing: border-box;
}

.profile-container {
    font-family: 'DM Sans', sans-serif;
    width: 100%;
}

.top-profile {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 20px;
}

.welcome {
    font-size: 40px;
    margin-right: auto;
    color: #033f63;
    font-weight: bold;
}

.profile_image {
    width: 100px;
    height: 100px;
    background-color: #ddd;
    border-radius: 50%;
    margin-left: 50px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.user-grid {
    margin-top: 15px;
    margin-left: 60px;
    margin-right: 60px;
    margin-bottom: 40px;
}

.user_profile-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    width: 90%;
    max-height: 600px;
    overflow-y: auto;
    overflow-x: auto;
    padding: 10px;
}

.functionality-box {
    background-color: #b2d4eb;
    text-align: center;
    min-height: 220px;
    height: 180px;
    width: 100%;
    max-width: 770px;
    margin: 0 auto;
    box-sizing: border-box;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    text-align: center;
    overflow: auto;
    box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.2);
}

.functionality-box:hover {
    transform: translate(0, -20px);
}

.my-listings {
    font-size: 20px;
    font-family: 'DM Sans', sans-serif;
    font-weight: bold;
    color: #033f63;
    max-width: 700px;
    padding: 25px;
    text-align: center;
    margin-left: auto;
    margin-right: auto;
    align-items: center;
    justify-content: center;
}

.balance-container {
    display: flex;
    align-items: center;
    justify-content: flex-end; 
    margin-top: 20px;
    width: auto;
}

.profile-balance {
    font-size: 16px;
    color: #033f63;
    width: 60px;
    font-family: 'DM Sans', sans-serif;
}

.show-balance {
    padding: 10px;
    color: #033f63;
    border: 1px solid #ccc;
    font-size: 18px;
    border-radius: 4px;
    width: 200px;
    box-sizing: border-box;
}

.balance-button {
    width: 220px;
    height: 40px;
    margin-right: 45px;
    background-color: #033f63;
    color: #ffffff;
    border-radius: 30px;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    transition: background-color 0.2s, color 0.2s;
}

.balance-button:hover {
    background-color: #022c47;
    color: #ffffff;
}

.add-container {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 10px;
}

.add-button {
    width: 80px;
    height: 80px;
    background-color: #033f63;
    color: white;
    border-radius: 50%;
    font-size: 35px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 8px rgba(255, 255, 255, 0.2);
    transition: background-color 0.2s, color 0.2s;
}

.add-button:hover {
    background-color: #022c47;
    color: #ffffff;
}

.my-listings-container {
    display: flex;
    flex-direction: row;
    gap: 5px;
    align-items: center;
    width: 100%;
    margin-bottom: 10px;
}

.my-listings_label {
    font-size: 18px;
    color: #033f63;
    margin-left: 20px;
    width: auto;
    max-width: 140px;
    font-family: 'DM Sans', sans-serif;
    display: inline-flex;
    align-items: center;
    box-sizing: border-box;
}

.show-listings {
    padding: 10px;
    border: 1px solid #ccc;
    font-size: 14px;
    margin-right: 20px;
    max-width: 70%;
    width: 100%;
    border-radius: 4px;
    box-sizing: border-box;
    margin-left: auto;
    overflow-y: auto;
}

.my-listings-button {
    display: inline-flex;
    align-items: center;
    box-sizing: border-box;
    gap: 20px;
}

.accept-bid {
    width: 120px;
    height: 40px;
    background-color: #033f63;
    color: #ffffff;
    border-radius: 30px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.2s, color 0.2s;
    margin-right: 20px;
}

.deny-bid {
    width: 120px;
    height: 40px;
    background-color: #033f63;
    color: #ffffff;
    border-radius: 30px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.2s, color 0.2s;
}

.accept-bid:hover {
    background-color: #022c47;
    color: #ffffff;
}

.deny-bid:hover {
    background-color: #022c47;
    color: #ffffff;
}

.show-messages {
    padding: 10px;
    border: 1px solid #ccc;
    font-size: 14px;
    margin-right: 20px;
    max-width: 70%;
    width: 100%;
    border-radius: 4px;
    box-sizing: border-box;
    margin-left: auto;
    overflow-y: auto;
}

.message-info {
    padding: 10px;
    color: #033f63;
    background-color: white;
    border: 1px solid #ccc;
    display: block;
    justify-content: center;
    align-self: center;
    font-size: 14px;
    border-radius: 4px;
    width: 93%;
    box-sizing: border-box;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 10px;
}

.read {
    width: 120px;
    height: 40px;
    background-color: #033f63;
    color: #ffffff;
    border-radius: 30px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.2s, color 0.2s;
    margin-left: auto;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 20px;
}

.read:hover {
    background-color: #022c47;
    color: #ffffff;
}

.file-label {
    font-size: 16px;
    color: #033f63;
    margin: 0 auto; 
    width: auto;
    max-width: 500px;
    justify-content: center; 
    font-family: 'DM Sans', sans-serif;
    display: flex; 
    align-items: center;
    box-sizing: border-box;
}

.access-file {
    width: 200px;
    height: 40px;
    background-color: #033f63;
    color: #ffffff;
    border-radius: 30px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.2s, color 0.2s;
}

.access-file:hover {
    background-color: #022c47;
    color: #ffffff;
}



@media (max-width: 768px) {
    .user_profile-grid {
        grid-template-columns: 1fr; 
    }

    .welcome {
        font-size: 30px; 
    }

    .my-listings {
        font-size: 30px; 
    }

    .profile_image{
        width: 80px; 
        height: 80px;
    }

    .balance-button{
        width: 80px; 
        height: 80px;
    }

    .read {
        width: 80px; 
        height: 80px;
    }

    .add-button {
        width: 80px; 
        height: 80px;
    }
}


