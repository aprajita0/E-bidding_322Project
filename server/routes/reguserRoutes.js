const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User'); 
const RegularUser = require('../models/RegUser');
const Visitor = require('../models/Visitor'); 
const SuperUser = require('../models/SuperUser'); 
const Listing = require('../models/Listings');
const Bid = require('../models/Bid'); 
const Notification = require('../models/Notification');
const Raffle = require('../models/Raffle');
const Rating = require('../models/Ratings');
const Transaction = require('../models/Transaction');
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const Complaint = require('../models/Complaints');
const Comment = require('../models/Comments');

// Middleware to verify token
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; 
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid token.' });
    }
};

router.post('/add-listing', authMiddleware, async (req, res) => {
    const { name, description, type, price_from, price_to} = req.body;

    try {
        // Validate required fields
        if (!name || !description || !type || !price_from || !price_to) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        // Validate amount is a positive number
        if (isNaN(price_from) || price_from <= 0) {
            return res.status(400).json({ error: 'Invalid price_from specified.' });
        }

        if (isNaN(price_to) || price_to <= 0) {
            return res.status(400).json({ error: 'Invalid price_to specified.' });
        }

        // Create and save a new listing
        const listing = new Listing({
            user_id: req.user.id, //
            name,
            description,
            type,
            price_from: mongoose.Types.Decimal128.fromString(price_from.toString()),
            price_to: mongoose.Types.Decimal128.fromString(price_to.toString()),
            date_listed: new Date(), 
        });

        await listing.save();

        res.status(201).json({ message: 'Listing added successfully', listing });
    } catch (error) {
        console.error('Error adding listing:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});


router.post('/suspend-reguser', async (req, res) => {
    try {
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({ error: 'User ID is required.' });
        }

        // Check if the user exists and is a regular user
        const user = await User.findById(user_id);
        if (!user || user.role !== 'reguser') {
            return res.status(404).json({ error: 'User not found or not a regular user.' });
        }

        // Fetch the user's ratings
        const ratings = await Rating.find({ rater_id: user_id });
        if (ratings.length < 3) {
            return res.status(400).json({ error: 'User does not have enough ratings to evaluate suspension.' });
        }

        // Calculate the average rating
        const averageRating = ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length;

        if (averageRating < 2) {
            // Suspend the user
            user.account_status = false; // Suspended
            user.suspension_count += 1;

            // Check if the user is permanently banned
            if (user.suspension_count >= 3) {
                user.role = 'banned'; // Forcibly remove the user
            }

            await user.save();

            res.status(200).json({ message: 'User suspended successfully.', user });
        } else {
            res.status(400).json({ error: 'User does not meet the suspension criteria.' });
        }
    } catch (error) {
        console.error('Error suspending user:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

router.post('/pay-fine', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);  // Get the logged-in user
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Check if the user is suspended
        if (user.account_status === true) {
            return res.status(400).json({ error: 'User is not suspended.' });
        }

        // Ensure the user has at least $50 to pay the fine
        const fineAmount = 50.00;
        const userBalance = parseFloat(user.account_balance.toString());

        if (userBalance < fineAmount) {
            return res.status(400).json({ error: 'Insufficient balance to pay the fine.' });
        }

        // Deduct $50 from the user's balance
        user.account_balance = mongoose.Types.Decimal128.fromString(
            (userBalance - fineAmount).toString()
        );

        // Reactivate the user and update their account status
        user.account_status = true;  // Set the account status to active
        user.suspension_count = 0;  // Reset suspension count

        // Save the updated user data
        await user.save();

        // Optionally, update the RegularUser model if needed
        const regularUser = await RegularUser.findOne({ user_id: user._id });
        if (regularUser) {
            regularUser.suspended = false;  // Mark the user as unsuspended in RegularUser model
            await regularUser.save();
        }

        // Create a transaction record for the fine payment
        const transaction = new Transaction({
            buyer_id: user._id,  // User who paid the fine (same as buyer)
            amount: mongoose.Types.Decimal128.fromString(fineAmount.toString()),  // Fine amount
            transaction_date: new Date(),  // Date of the transaction
        });

        // Save the transaction record
        await transaction.save();

        const deletedRatings = await Rating.deleteMany({ rater_id: user._id });

        // Respond with success
        res.status(200).json({
            message: 'Fine paid successfully. User is now unsuspended.',
            user: {
                id: user._id,
                username: user.username,
                account_balance: user.account_balance,
                account_status: user.account_status,
            },
            transaction: {
                transaction_id: transaction._id,
                amount: transaction.amount,
                transaction_date: transaction.transaction_date,
            },
            ratings_removed: deletedRatings.deletedCount,
        });
    } catch (error) {
        console.error('Error paying fine:', error.message);
        res.status(500).json({ error: 'Internal server error.', details: error.message });
    }
});
        



module.exports = router;
