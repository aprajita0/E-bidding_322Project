const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User'); 
const Listing = require('../models/Listings');
const Notification = require('../models/Notification');
const Raffle = require('../models/Raffle');
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

// Add a complaint
router.post('/add-complaint', authMiddleware, async (req, res) => {
    try {
        // Find the authenticated user
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const { subject_id, description } = req.body;

        // Validate required fields
        if (!subject_id || !description) {
            return res.status(400).json({ error: 'Subject ID and description are required.' });
        }

        // Create a new complaint with the authenticated user as the complainer
        const newComplaint = new Complaint({
            complainer_id: user._id, // Set complainer_id to the authenticated user's ID
            subject_id,
            description
        });

        // Save the complaint to the database
        await newComplaint.save();

        return res.status(201).json({
            message: 'Complaint added successfully',
            complaint: newComplaint
        });
    } catch (error) {
        console.error('Error adding complaint:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});


//add-comment
router.post('/add-comment', authMiddleware, async (req, res) => {
    try {
        const { listing_id, comment } = req.body;

        // Validate required fields
        if (!listing_id || !comment) {
            return res.status(400).json({ error: 'Listing ID and comment are required.' });
        }

        // Validate comment length
        if (comment.length > 500) {
            return res.status(400).json({ error: 'Comment exceeds maximum length of 500 characters.' });
        }

        // Check if listing exists
        const listing = await Listing.findById(listing_id);
        if (!listing) {
            return res.status(404).json({ error: 'Listing not found.' });
        }

        // Create and save the comment
        const newComment = new Comment({
            listing_id,
            commenter_id: req.user.id, // From auth middleware
            comment,
            date_added: new Date()
        });

        await newComment.save();

        res.status(201).json({ 
            message: 'Comment added successfully', 
            comment: newComment 
        });

    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// Get comments for a listing
router.get('/get-comments/:listing_id', async (req, res) => {
    try {
        const { listing_id } = req.params;

        const comments = await Comment.find({ listing_id })
            .populate('commenter_id', 'username') // Only get username from User
            .sort({ date_added: -1 }); // Most recent first

        res.status(200).json(comments);
    } catch (error) {
        console.error('Error getting comments:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// buy-listing
router.post('/buy-listing', authMiddleware, async (req, res) => {
    const { listing_id } = req.body;

    try {
        // Find the listing by ID
        const listing = await Listing.findById(listing_id);
        if (!listing) {
            return res.status(404).json({ error: 'Listing not found.' });
        }

        // Find the user who is making the purchase
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Check if the user has enough balance
        const listingPrice = parseFloat(listing.price_from.toString()); // Assuming price_from is the price for the listing
        if (parseFloat(user.account_balance.toString()) < listingPrice) {
            return res.status(400).json({ error: 'Insufficient balance.' });
        }

        // Deduct the amount from the user's account
        user.account_balance = mongoose.Types.Decimal128.fromString(
            (parseFloat(user.account_balance.toString()) - listingPrice).toString()
        );

        // Mark the listing as purchased or sold
        listing.status = 'sold'; // Assuming you add a 'status' field to the listing model

        // Save the user and listing updates
        await user.save();
        await listing.save();


        res.status(200).json({ 
            message: 'Listing purchased successfully', 
            newBalance: user.account_balance, 
            listing 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

  
  module.exports = router;
