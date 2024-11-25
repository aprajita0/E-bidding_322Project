const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User'); 
const Visitor = require('../models/Visitor'); 
const SuperUser = require('../models/SuperUser'); 
const RegularUser = require('../models/RegUser');
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
        const savedUser = await user.save();

        if (role === 'superuser') {
            const superUser = new SuperUser({ user_id: savedUser._id });
            await superUser.save();
        } else if (role === 'reguser') {
            const regularUser = new RegularUser({ user_id: savedUser._id });
            await regularUser.save();
        } else {
            const visitor = new Visitor({ user_id: savedUser._id });
            await visitor.save();
        }

        
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

        if (user.account_status === false) {
            return res.status(403).json({ message: 'Account is suspended' });
        }

        // Generate JWT token
        if (user.account_status === false) {
            return res.status(403).json({ message: 'Account is suspended' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id.toString(), role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Respond with success
   
        res.json({
            message: 'Login successful',
            token,
            username: user.username,
            role: user.role,
            role: user.role,
        });
    } catch (err) {
        // Handle server errors
        console.error('Login error:', err);
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

router.post('/read-notify', authMiddleware, async (req, res) => {
    try {
        const { notification_id } = req.body; // Extract notification ID from the request body

        // Validate request body
        if (!notification_id) {
            return res.status(400).json({ error: 'Notification ID is required.' });
        }

        // Find the notification
        const notification = await Notification.findById(notification_id);
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found.' });
        }

        // Check if the current user is the recipient of the notification
        if (notification.to_id.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Access denied. You are not the recipient of this notification.' });
        }

        // Mark the notification as read
        notification.read_status = true;
        await notification.save();

        res.status(200).json({
            message: 'Notification marked as read successfully.',
            notification,
        });
    } catch (error) {
        console.error('Error marking notification as read:', error.message);
        res.status(500).json({ error: 'Internal server error.', details: error.message });
    }
});

router.get('/get-bids', authMiddleware, async (req, res) => {
    try {
        const { listing_id } = req.body; // Now extract listing_id from the body

        // Validate that listing_id is provided in the body
        if (!listing_id) {
            return res.status(400).json({ error: 'Listing ID is required in the request body.' });
        }

        // Find the listing to ensure it exists
        const listing = await Listing.findById(listing_id);
        if (!listing) {
            return res.status(404).json({ error: 'Listing not found.' });
        }

        // Check if the current user is the owner of the listing
        if (listing.user_id.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Access denied. You are not the owner of this listing.' });
        }

        // Fetch all bids for the specified listing
        const bids = await Bid.find({ listing_id }).select('amount bid_expiration -_id'); // Exclude unnecessary fields

        // Return the bids
        res.status(200).json({
            message: 'Bids retrieved successfully.',
            bids,
        });
    } catch (error) {
        console.error('Error fetching bids:', error.message);
        res.status(500).json({ error: 'Internal server error.', details: error.message });
    }
});

router.post('/rate-transactions', authMiddleware, async (req, res) => {
    try {
        const { transaction_id, rating } = req.body;
        
        if (!transaction_id || !rating) {
            return res.status(400).json({ error: 'Transaction ID and rating are required.' });
        }


        const transaction = await Transaction.findById(transaction_id);
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found.' });
        }

        
        if (transaction.buyer_id.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Access denied. You are not a participant in this transaction.' });
        }

        
        const parsedRating = parseFloat(rating);
        if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
            return res.status(400).json({ error: 'Rating must be a number between 1 and 5.' });
        }

        // Check if the user has already rated this transaction
        const existingRating = await Rating.findOne({ rater_id: req.user.id, transaction_id });
        if (existingRating) {
            return res.status(400).json({ error: 'You have already rated this transaction.' });
        }

        // Create and save the new rating
        const newRating = new Rating({
            rater_id: req.user.id,
            transaction_id,
            rating: parsedRating,
        });

        await newRating.save();

        res.status(201).json({ message: 'Rating submitted successfully.', rating: newRating });
    } catch (error) {
        console.error('Error rating transaction:', error.message);
        res.status(500).json({ error: 'Internal server error.', details: error.message });
    }
});


router.get('/get-listing-rating', authMiddleware, async (req, res) => {
    try {
        const { listingId } = req.body;
    
        const transactions = await Transaction.find({ listing_id: listingId });
    
        if (transactions.length === 0) {
          return res.status(404).json({ message: 'No transactions found for this listing.' });
        }
    
        // Extract transaction IDs
        const transactionIds = transactions.map((transaction) => transaction._id);
    
        // Find ratings associated with these transactions
        const ratings = await Rating.find({ transaction_id: { $in: transactionIds } })
        if (ratings.length === 0) {
          return res.status(404).json({ message: 'No ratings found for this listing.' });
        }
    
        res.status(200).json(ratings);
      } catch (error) {
        console.error('Error fetching ratings:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
      }
});


router.post('/apply-reguser', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        if (user.role !== 'visitor') {
            return res.status(400).json({
                message: "Only visitors can apply for a regular user account."
            });
        }

        // Query Visitor table using the user's ID (use req.user.id here)
        const visitor = await Visitor.findOne({ user_id: req.user.id });
        if (!visitor) {
            return res.status(404).json({
                message: "Visitor record not found. Please contact support."
            });
        }

        // Step 3: Update the application status
        visitor.application_status = 'Pending';
        visitor.CAPTCHA_question = true; 
        await visitor.save();

        res.status(200).json({
            message: "Application for regular user submitted successfully. Status: Pending.",
            visitor
        });
    } catch (error) {
        console.error("Error processing application:", error);
        res.status(500).json({
            message: "Failed to process application for regular user.",
            error: error.message
        });
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
