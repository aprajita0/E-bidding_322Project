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
const Transaction = require('../models/Transaction');

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
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email }); 
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Check if the account is suspended
        if (user.account_status === false) {
            return res.status(403).json({ message: 'Account is suspended' });
        }

        const token = jwt.sign(
            { id: user._id.toString(), username: user.username, role: user.role }, 
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
        const { to_id, notification_type, subject, message } = req.body;
        const user = await User.findById(req.user.id);

        if (!to_id || !notification_type || !subject || !message) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        const notification = new Notification({
            to_id,
            notification_type,
            subject,
            message,
        });

        await notification.save();

        res.status(201).json({ message: 'Notification added successfully', notification });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

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
        if (parseFloat(amount) < parseFloat(listing.price_from)) {
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

        // Create the bid (without deducting balance)
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

router.post('/get-bids', authMiddleware, async (req, res) => {
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
        const bids = await Bid.find({ listing_id })

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

        
        if (transaction.buyer_id.toString() !== req.user.id || transaction.seller_id.toString() !== req.user.id) {
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

router.post('/get-listing-rating', authMiddleware, async (req, res) => {
    try {
        const { listingId } = req.body; 
    
        if (!listingId) {
            return res.status(400).json({ message: 'listingId is required.' });
        }
    
        const transactions = await Transaction.find({ listing_id: listingId });
    
        if (transactions.length === 0) {
            return res.status(404).json({ message: 'No transactions found for this listing.' });
        }
    
        // Extract transaction IDs
        const transactionIds = transactions.map((transaction) => transaction._id);
    
        
        const ratings = await Rating.find({ transaction_id: { $in: transactionIds } });
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

        
        const visitor = await Visitor.findOne({ user_id: req.user.id });
        if (!visitor) {
            return res.status(404).json({
                message: "Visitor record not found. Please contact support."
            });
        }

        
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

router.post('/accept-bid', authMiddleware, async (req, res) => {
    const { bid_id, listing_id } = req.body;
  
    try {
      // Find the bid
      const bid = await Bid.findById(bid_id);
      if (!bid) {
        return res.status(404).json({ error: 'Bid not found.' });
      }
  
      // Find the listing
      const listing = await Listing.findById(listing_id);
      if (!listing) {
        return res.status(404).json({ error: 'Listing not found.' });
      }
  
      // Check if the listing is still available
      if (listing.status !== 'available') {
        return res.status(400).json({ error: 'Listing is no longer available.' });
      }
  
      // Find the buyer and seller
      const buyer = await User.findById(bid.bidder_id);
      const seller = await User.findById(listing.user_id);
      if (!buyer || !seller) {
        return res.status(404).json({ error: 'User(s) not found.' });
      }
  
      // Check if the buyer has enough balance to cover the bid amount
      const bidAmount = parseFloat(bid.amount.toString());
      if (parseFloat(buyer.account_balance.toString()) < bidAmount) {
        return res.status(400).json({ error: 'Buyer has insufficient balance.' });
      }
  
      // Deduct the amount from the buyer's account balance
      buyer.account_balance = mongoose.Types.Decimal128.fromString(
        (parseFloat(buyer.account_balance.toString()) - bidAmount).toString()
      );
  
      // Add the amount to the seller's account balance
      seller.account_balance = mongoose.Types.Decimal128.fromString(
        (parseFloat(seller.account_balance.toString()) + bidAmount).toString()
      );
  
      // Mark the listing as sold
      listing.status = 'sold';
  
      // Create a transaction for the purchase
      const transaction = new Transaction({
        buyer_id: buyer._id,
        seller_id: seller._id,
        listing_id: listing._id,
        amount: bid.amount,
        transaction_date: new Date(),
      });
  
      // Save the updates
      await buyer.save();
      await seller.save();
      await listing.save();
      await transaction.save();
  
      // Remove the bid from the database
      await Bid.findByIdAndDelete(bid._id);
  
      res.status(200).json({
        message: 'Bid accepted and transaction completed successfully.',
        newBalanceBuyer: buyer.account_balance,
        newBalanceSeller: seller.account_balance,
        transaction,
        listing,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  });
  
  router.get('/get-complaint', authMiddleware, async (req, res) => {
    try {
        // Extract query parameters for filtering
        const { complainer_id, subject_id, complaint_status } = req.query;

        // Build filter object based on the available query parameters
        const filter = {};

        // Only include fields in the filter if they are provided in the query
        if (complainer_id) {
            filter.complainer_id = complainer_id; // Complainer ID is a string, so no need for conversion
        }

        if (subject_id) {
            try {
                filter.subject_id = mongoose.Types.ObjectId(subject_id); // Convert subject_id to ObjectId
            } catch (error) {
                return res.status(400).json({ error: 'Invalid Subject ID format.' });
            }
        }

        if (complaint_status) {
            filter.complaint_status = complaint_status; // Complaint status is a string, no need for conversion
        }

        // Query the complaints collection with the built filter
        const complaints = await Complaint.find(filter).populate('subject_id');

        // Return the filtered complaints
        res.status(200).json(complaints);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

  
//unsuspend-account
router.post('/unsuspend-account', authMiddleware, async (req, res) => {
    const { user_id } = req.body;
    try {
        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        // Unsuspend the account without fine
        user.account_status = true;
        await user.save();
        res.status(200).json({ message: 'Account unsuspended successfully.', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});
//get-suspended-account
router.get('/get-suspended-account', authMiddleware, async (req, res) => {
    try {
        const suspendedUsers = await User.find({ account_status: false });
        
        const suspendedUsersInfo = suspendedUsers.map(user => ({
            user_id: user._id,
            username: user.username,
            suspension_count: user.suspension_count
        }));
        
        res.status(200).json(suspendedUsersInfo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});
// Check VIP status API
router.get('/check-vip', authMiddleware, async (req, res) => {
    try {
        
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        
        const regularUser = await RegularUser.findOne({ user_id: req.user.id });
        if (!regularUser) {
            return res.status(404).json({ error: 'RegularUser record not found.' });
        }

  
      const amount = 5000;
  
      if (user.account_balance >= amount) {
        if (!regularUser.vip) {
          regularUser.vip = true;
          await regularUser.save(); 
        }
        return res.status(200).json({ message: 'User is VIP' });
      } else {
        
        if (regularUser.vip) {
          regularUser.vip = false;
          await regularUser.save(); // Save the RegularUser document
        }
        return res.status(200).json({ message: 'User is not VIP' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

router.get('/get-transactions', authMiddleware, async (req, res) => {
    try {
        
        const buyerId = req.user.id;

        const user = await User.findById(buyerId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const transactions = await Transaction.find({ buyer_id: buyerId })
            .populate('seller_id', 'first_name last_name email') 
            .populate('listing_id', 'name price_from price_to'); 

        
        res.status(200).json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Server error.' });
    }
});

router.post('/deny-user', authMiddleware, async (req, res) => {
    const { user_id } = req.body;

    try {
        if (!user_id) {
            return res.status(400).json({ error: 'User ID is required.' });
        }

        // Find the visitor by user_id
        const visitor = await Visitor.findOne({ user_id });
        if (!visitor) {
            return res.status(404).json({ error: 'Visitor not found.' });
        }

        // Check if the visitor's application is in the "Pending" state
        if (visitor.application_status !== 'Pending') {
            return res.status(400).json({ error: 'The application is not pending, cannot deny.' });
        }

        // Deny the application by changing the application status to "Rejected"
        visitor.application_status = 'Rejected';
        await visitor.save();

        res.status(200).json({
            message: 'Visitor application denied successfully.',
            visitor: {
                user_id: visitor.user_id,
                application_status: visitor.application_status
            }
        });
    } catch (error) {
        console.error('Error denying user:', error.message);
        res.status(500).json({ error: 'Internal server error.', details: error.message });
    }
});

router.get('/get-notif', authMiddleware, async (req, res) => {
    try {
        // Fetch unread notifications for the logged-in user
        const notifications = await Notification.find({
            to_id: req.user.id,    // Match the user ID
            read_status: false      // Only get unread notifications
        }).select('notification_type notification');  // Select notification_type and notification fields

        if (notifications.length === 0) {
            return res.status(404).json({ message: 'No unread notifications found.' });
        }

        // Return the notifications
        res.status(200).json({ notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error.message);
        res.status(500).json({ error: 'Internal server error.', details: error.message });
    }
});

router.get('/check-acccount-status', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        if (user.role === 'banned') {
            return res.status(200).json({ message: 'Account is banned.' });
        }

        if (user.account_status === false) {
            return res.status(200).json({ message: 'Account is suspended.' });
        }

        if (user.account_status === true) {
            return res.status(200).json({ message: 'Account is active.' });
        }

        res.status(200).json({ user});

    } catch (error) {
        console.error('Error fetching account status:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

router.post('/', authMiddleware, async (req, res) => {
    const { subject_id, description } = req.body;
    try {
        const complaint = new Complaint({
            complainer_id: req.user.id,  // Assuming the logged-in user's ID is in the token
            subject_id,
            description,
        });
        await complaint.save();
        res.status(201).json({ message: 'Complaint created successfully', complaint });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error creating complaint', details: err.message });
    }
});

router.get('/', authMiddleware, async (req, res) => {
    try {
        const complaints = await Complaint.find({ complainer_id: req.user.id }).populate('subject_id', 'name'); // Optionally populate subject_id with listing or transaction info
        res.status(200).json({ complaints });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error retrieving complaints', details: err.message });
    }
});

router.post('/resolve-complaint', authMiddleware, async (req, res) => {
    const { complaint_id } = req.body;
    try {
        const complaint = await Complaint.findById(complaint_id);
        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found.' });
        }
        complaint.complaint_status = 'Resolved';
        await complaint.save();
        res.status(200).json({ message: 'Complaint resolved successfully', complaint });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error resolving complaint', details: err.message });
    }
});

router.post('/dismiss-complaint', authMiddleware, async (req, res) => {
    const { complaint_id } = req.body;
    try {
        const complaint = await Complaint.findById(complaint_id);
        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found.' });
        }

        complaint.complaint_status = 'Dismissed';
        await complaint.save();

        res.status(200).json({ message: 'Complaint dismissed successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error dismissing complaint', details: err.message });
    }
});

router.post('/deny-bid', authMiddleware, async (req, res) => {
    const { bid_id } = req.body;

    try {

        const bid = await Bid.findById(bid_id);
        if (!bid) {
            return res.status(404).json({ error: 'Bid not found.' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        
        await Bid.findByIdAndDelete(bid_id);

        res.status(200).json({ message: 'Bid denied successfully.' });
    } catch (error) {
        console.error('Error denying bid:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});
         

module.exports = router;
