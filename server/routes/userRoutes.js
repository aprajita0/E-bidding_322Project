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

// Registration endpoint
router.post('/register', async (req, res) => {
    const { first_name, last_name, username, password, email, address_line_1, address_line_2, role } = req.body;

    try {

        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }


        const hashedPassword = await bcrypt.hash(password, 10);


        const user = new User({
            first_name,
            last_name,
            username,
            password: hashedPassword,
            email,
            address_line_1,
            address_line_2,
            role
        });

        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error registering user', details: err.message });
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        
        const token = jwt.sign(
            { id: user._id.toString(), username: user.username}, // Convert `_id` to string
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Login successful',
            token,
            username: user.username,
            role: user.role
        });
    } catch (err) {
        res.status(500).json({ error: 'Error logging in', details: err.message });
    }
});

router.post('/add-balance', authMiddleware, async (req, res) => {
    try {
        console.log("User ID from token:", req.user.id); 
        const { amount } = req.body;

        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount specified.' });
        }

        // Find user by ID
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Add balance to user account
        user.account_balance = mongoose.Types.Decimal128.fromString(
            (parseFloat(user.account_balance.toString()) + parseFloat(amount)).toString()
        );

        await user.save();

        res.status(200).json({ message: 'Balance added successfully', newBalance: user.account_balance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});


router.get('/get-balance', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.status(200).json({ account_balance: user.account_balance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

router.post('/withdraw-balance', authMiddleware, async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount specified.' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        if (parseFloat(user.account_balance.toString()) < parseFloat(amount)) {
            return res.status(400).json({ error: 'Insufficient balance.' });
        }

        
        user.account_balance = mongoose.Types.Decimal128.fromString(
            (parseFloat(user.account_balance.toString()) - parseFloat(amount)).toString()
        );

        await user.save();

        res.status(200).json({ message: 'Balance withdrawn successfully', newBalance: user.account_balance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

router.get('/get-listing', async (req, res) => {
    try {
        const listings = await Listing.find({});
        res.status(200).json(listings);
    } catch (error) {   
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

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

//New route to get a specific listing by ID
router.get('/get-listing/:id', async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({ error: 'Listing not found.' });
        }

        res.status(200).json(listing);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

router.post('/add-notification', authMiddleware, async (req, res) => {
    try {
        const { to_id, notification_type } = req.body;
        const user = await User.findById(req.user.id);

        if (!to_id || !notification_type) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        const notification = new Notification({
            to_id,
            notification_type,
        });

        await notification.save();

        res.status(201).json({ message: 'Notification added successfully', notification });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

router.post('/add-raffle', authMiddleware, async (req, res) => {
    try {
        const { raffle_name, prize, start_date, end_date } = req.body;
        const user = await User.findById(req.user.id);

        if (!raffle_name || !prize || !start_date || !end_date) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        const raffle = new Raffle({
            raffle_name,
            prize,
            start_date,
            end_date,
        });

        await raffle.save();

        res.status(201).json({ message: 'Raffle added successfully', raffle });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

router.get('/get-raffles', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const raffles = await Raffle.find({});
        res.status(200).json(raffles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

//bid-listing
router.post('/bid-listing', authMiddleware, async (req, res) => {
    const { listing_id, amount, bid_expiration } = req.body;

    try {
        console.log('POST /api/users/bid-listing reached');

        // Validate the required fields
        if (!listing_id || !amount || !bid_expiration) {
            console.error('Validation failed: Missing required fields.');
            return res.status(400).json({
                error: 'Validation failed: Listing ID, amount, and bid expiration are required.',
            });
        }

        // Validate the listing
        const listing = await Listing.findById(listing_id);
        if (!listing) {
            console.error(`Listing not found for ID: ${listing_id}`);
            return res.status(404).json({ error: 'Listing not found.' });
        }

        // Validate the amount is greater than the listing price
        if (parseFloat(amount) <= parseFloat(listing.price_from)) {
            console.error(`Bid amount (${amount}) must be greater than the listing price (${listing.price_from}).`);
            return res.status(400).json({
                error: `Bid amount must be greater than the listing price (${listing.price_from}).`,
            });
        }

        // Parse and validate the expiration date
        const expirationDate = new Date(bid_expiration);
        if (isNaN(expirationDate.getTime())) {
            console.error('Validation failed: Invalid expiration date format.');
            return res.status(400).json({ error: 'Invalid bid expiration date format.' });
        }

        // Validate the user's account balance
        const user = await User.findById(req.user.id);
        if (!user) {
            console.error(`User not found for ID: ${req.user.id}`);
            return res.status(404).json({ error: 'User not found.' });
        }

        const userBalance = parseFloat(user.account_balance.toString());
        if (userBalance < parseFloat(amount)) {
            console.error(`Insufficient balance. User balance: ${userBalance}, Bid amount: ${amount}`);
            return res.status(400).json({
                error: 'Insufficient balance to place this bid.',
            });
        }

        // Create the bid
        const bid = new Bid({
            listing_id,
            bidder_id: req.user.id,
            amount: mongoose.Types.Decimal128.fromString(amount.toString()),
            bid_expiration: expirationDate,
        });

        // Save the bid
        await bid.save();

        console.log(`Bid created successfully: ${JSON.stringify(bid)}`);
        res.status(201).json({ message: 'Bid created successfully', bid });
    } catch (error) {
        console.error(`Error creating bid: ${error.message}`);
        res.status(500).json({ error: 'Internal server error.', details: error.message });
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

router.post('/approve-reguser', authMiddleware, async (req, res) => {
    try {
        const { visitor_id } = req.body; // Extract visitor_id from the request body

        // Ensure the requester is a super-user
        const superUser = await User.findById(req.user.id);
        if (!superUser || superUser.role !== 'superuser') {
            return res.status(403).json({ error: 'Access denied. Only super-users can approve users.' });
        }

        // Check if the visitor exists and their application is pending
        const visitor = await Visitor.findOne({ user_id: visitor_id });
        if (!visitor || visitor.application_status !== 'Pending') {
            return res.status(404).json({ error: 'Visitor application not found or not in a pending state.' });
        }

        // Ensure CAPTCHA was passed
        if (!visitor.CAPTCHA_question) {
            return res.status(400).json({ error: 'Visitor did not complete the CAPTCHA verification.' });
        }

        // Approve the visitor
        const user = await User.findById(visitor_id);
        if (!user) {
            return res.status(404).json({ error: 'User not found for the visitor.' });
        }

        // Update the user's role to regular user
        user.role = 'reguser';
        await user.save();

        // Create a RegularUser entry
        const regularUser = new RegularUser({ user_id: user._id });
        await regularUser.save();

        // Update the visitor's application status
        visitor.application_status = 'Approved';
        await visitor.save();

        // Increment the super-user's approved_users count
        const superUserStats = await SuperUser.findOne({ user_id: req.user.id });
        if (superUserStats) {
            superUserStats.approved_users += 1;
            await superUserStats.save();
        }

        res.status(200).json({
            message: 'Visitor successfully approved as a regular user.',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Error approving visitor:', error.message);
        res.status(500).json({ error: 'Internal server error.', details: error.message });
    }
});


module.exports = router;
