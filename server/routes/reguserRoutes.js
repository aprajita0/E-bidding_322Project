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

router.get('/get-user-listings', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const listings = await Listing.find({ user_id: user.id });
        res.status(200).json(listings);
    } catch (error) {
        console.error(error);
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

module.exports = router;