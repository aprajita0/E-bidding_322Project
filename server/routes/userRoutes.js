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

        /*Check if the account is suspended
        if (user.account_status === false) {
            return res.status(403).json({ message: 'Account is suspended' });
        } */

        const token = jwt.sign(
            { id: user._id.toString(), username: user.username, role: user.role }, 
            JWT_SECRET,
            { expiresIn: '1h' } 
        );

        res.json({
            message: 'Login successful',
            token,
            username: user.username,
            role: user.role,
            userId: user._id
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
        const listings = await Listing.find({ user_id: user.id, status: { $ne: 'sold' }  });
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

        const user = await User.findById(user_id);
        if (!user || user.role !== 'reguser') {
            return res.status(404).json({ error: 'User not found or not a regular user.' });
        }

        if (user.account_status === false) {
            console.log('User is already suspended.');
            return res.status(200).json({
                message: 'User is already suspended.',
                user,
            });
        }
        
        const userTransactions = await Transaction.find({
            $or: [{ buyer_id: user_id }, { seller_id: user_id }],
        }).select('_id');

        console.log('Fetched Transactions:', userTransactions); 

        if (userTransactions.length === 0) {
            console.log('No transactions found for this user. Skipping suspension check.');
            return res.status(200).json({ message: 'User has no transactions. Suspension check not required.' });
        }

        const ratingsAgainstUser = await Rating.find({
            transaction_id: { $in: userTransactions.map((t) => t._id) },
            rater_id: { $ne: user_id }, 
        });
        
        console.log('Fetched Ratings Against User:', ratingsAgainstUser);
        
        if (!ratingsAgainstUser || ratingsAgainstUser.length === 0) {
            console.log('No ratings found against this user.');
            return res.status(200).json({ message: 'No ratings found against this user.' });
        }

        if (ratingsAgainstUser.length < 2) {
            console.log('User has less than 2 ratings from others. Skipping suspension check.');
            return res.status(200).json({ message: 'User does not have enough ratings to evaluate suspension.' });
        }


        const averageRatingAgainstUser = ratingsAgainstUser.reduce((sum, rating) => sum + rating.rating, 0) / ratingsAgainstUser.length;
        console.log('Average Rating Against User:', averageRatingAgainstUser);

        const regularUser = await RegularUser.findOne({ user_id });

        if (regularUser && regularUser.vip) {
            if (averageRatingAgainstUser < 2 || averageRatingAgainstUser > 4) {
                // Downgrade VIP to regular user
                regularUser.vip = false;
                await regularUser.save();
                
                console.log(`VIP User ${user.username} downgraded due to rating: ${averageRatingAgainstUser}`);
                
                return res.status(200).json({ 
                    message: 'VIP user downgraded to regular user due to poor ratings.',
                    averageRating: averageRatingAgainstUser
                });
            }
        }
        
        // Suspension conditions
        if (averageRatingAgainstUser < 2 || averageRatingAgainstUser > 4) {
           
            user.account_status = false; 
            user.suspension_count += 1;

            
            if (user.suspension_count >= 3) {
                user.role = 'banned'; 
            }
            await user.save();
        
            const reason =
                averageRatingAgainstUser < 2
                    ? 'too mean (average rating below 2)'
                    : 'too generous (average rating above 4)';

            res.status(200).json({ 
                message: `User suspended successfully for being ${reason}.`,
                user,
            });
        } else {
            res.status(200).json({ error: 'User does not meet the suspension criteria.' });
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

        
        if (transaction.buyer_id.toString() !== req.user.id && transaction.seller_id.toString() !== req.user.id) {
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
  
      // Check if the listing is available or renting
      if (listing.status !== 'available' && listing.status !== 'renting' ){
        return res.status(400).json({ error: 'Listing is no longer available or is already rented.' });
      }
      
      const buyer = await User.findById(bid.bidder_id);
      const seller = await User.findById(listing.user_id);
      if (!buyer || !seller) {
        return res.status(404).json({ error: 'User(s) not found.' });
      }
      
      const reguserBuyer = await RegularUser.findOne({ user_id: buyer._id });
      const reguserSeller = await RegularUser.findOne({ user_id: seller._id });
      const buyerIsVIP = reguserBuyer?.vip || false;
      const sellerIsVIP = reguserSeller?.vip || false;
  
    
      const bidType = listing.type === 'buying' ? 'buying' : listing.type === 'selling' ? 'selling' : 'renting';
      const bidAmount = parseFloat(bid.amount.toString());
  
      let finalAmount;
      if (bidType === 'selling' || bidType === 'renting') {
        finalAmount = buyerIsVIP ? bidAmount * 0.9 : bidAmount;
      }
      else if (bidType === 'buying') {
        finalAmount = sellerIsVIP ? bidAmount * 0.9 : bidAmount;
      }
     else {
        finalAmount = bidAmount;
    }
    if (bidType === 'selling' || bidType === 'renting') {
        if (parseFloat(buyer.account_balance.toString()) < finalAmount) {
          return res.status(400).json({ error: 'Buyer has insufficient balance.' });
        }
        
        buyer.account_balance = mongoose.Types.Decimal128.fromString(
          (parseFloat(buyer.account_balance.toString()) - finalAmount).toString()
        );
        seller.account_balance = mongoose.Types.Decimal128.fromString(
          (parseFloat(seller.account_balance.toString()) + finalAmount).toString()
        );
      } else {  // 'buying' type
        if (parseFloat(seller.account_balance.toString()) < finalAmount) {
          return res.status(400).json({ error: 'Seller has insufficient balance.' });
        }
        seller.account_balance = mongoose.Types.Decimal128.fromString(
          (parseFloat(seller.account_balance.toString()) - finalAmount).toString()
        );
        buyer.account_balance = mongoose.Types.Decimal128.fromString(
          (parseFloat(buyer.account_balance.toString()) + finalAmount).toString()
        );
      }
      // Create a transaction for the purchase/rental
      const transaction = new Transaction({
        buyer_id: buyer._id,
        seller_id: seller._id,
        listing_id: listing._id,
        amount: finalAmount,
        transaction_date: new Date(),
      });
     
      await Listing.findByIdAndUpdate(listing._id, { status: 'sold' }, { new: true });

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
        // Step 1: Find the user by ID
        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Step 2: Unsuspend the account
        user.account_status = true;
        await user.save();

        // Step 3: Remove all ratings where the user is involved (either as rater or related to their transactions)
        await Rating.deleteMany({ rater_id: user_id });

        res.status(200).json({
            message: 'Account unsuspended successfully, and ratings have been reset.',
            user,
        });
    } catch (error) {
        console.error('Error unsuspending account:', error);
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
      // Fetch the user from the database
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      // Fetch the RegularUser record associated with the user
      const regularUser = await RegularUser.findOne({ user_id: req.user.id });
     
      if (!regularUser) {
        return res.status(404).json({ error: 'RegularUser record not found.' });
      }

      // Define VIP conditions
      const minBalance = 5000;
      const minTransactions = 5;
      const maxComplaints = 0;


      const buyerTransactions = await Transaction.countDocuments({ buyer_id: req.user.id });
      const sellerTransactions = await Transaction.countDocuments({ seller_id: req.user.id });
      const totalTransactions = buyerTransactions + sellerTransactions;
      regularUser.transaction_count = totalTransactions;
      await regularUser.save();
      console.log("Total Transactions (Buyer + Seller):", totalTransactions);
      const accountBalance = parseFloat(user.account_balance.toString()); 
      console.log("User Account Balance:", user.account_balance);
      console.log("Transaction Count:", regularUser.transaction_count);
      console.log("Complaints Count:", regularUser.complaints_count);
      
      if (
        accountBalance >= minBalance &&
        totalTransactions >= minTransactions &&
        regularUser.complaints_count === maxComplaints)  {
             if (!regularUser.vip) {
                console.log("Promoting user to VIP...")
                regularUser.vip = true;
                await regularUser.save();
        }
        
        return res.status(200).json({ message: 'User is VIP', vip: true });
    } else {
        // Downgrade to ordinary user if they were VIP
        if (regularUser.vip) {
          regularUser.vip = false;
          await regularUser.save();
        }
        return res.status(200).json({ message: 'User is not VIP', vip: false });
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

        const transactions = await Transaction.find({
            $or: [{ buyer_id: buyerId }, { seller_id: buyerId }]
          })
            .populate('seller_id', 'first_name last_name email')  // Populating seller fields
            .populate('listing_id', 'name price_from price_to'); // Populating listing fields
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

router.get('/check-account-status', authMiddleware, async (req, res) => {
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
        console.log("New complaint:", complaint);
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
         
// User applies to quit their account
router.post('/user-request-quit', authMiddleware, async (req, res) => {
    const { reason, delete_account } = req.body;

    // Check if the reason is provided
    if (!reason) {
        return res.status(400).json({ error: 'Reason for quitting is required.' });
    }

    // Check if the user has specified whether to delete the account or deactivate it
    if (delete_account === undefined) {
        return res.status(400).json({ error: 'Please specify if you want to delete your account (true/false).' });
    }

    try {
        // Find the user
        const user = await User.findById(req.user.id);
        console.log("Authenticated User ID:", req.user.id);


        if (!user) {
            console.log("User not found for ID:", req.user.id); // Debugging
            return res.status(404).json({ error: 'User not found.' });
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Create a quit request for the superuser to review
        user.quit_request = {
            reason: reason,
            delete_account: delete_account,
            status: 'pending'  // Pending approval
        };

        console.log("Quit Request Being Saved:", user.quit_request);
        
        await user.save();

        console.log("User updated with quit request:", await User.findById(req.user.id));

        // Notify the user that the request is received
        const notification = new Notification({
            to_id: user._id,
            notification_type: 'Account Quit Request Pending',
            notification: `Your request to quit the account is pending review by a Superuser.`
        });

        console.log("Notification Being Saved:", notification);
        await notification.save();

        res.status(200).json({
            message: 'Your quit request has been submitted for review.'
        });
    } catch (error) {
        console.error('Error processing quit request:', error);
        res.status(500).json({ error: 'Internal server error.', details: error.message });
    }
});

// Superuser approves/denies quit request
router.post('/approve-quit-request', authMiddleware, async (req, res) => {
    const { user_id, approve, delete_account } = req.body;

    // Ensure the user is a superuser
    const superUser = await User.findById(req.user.id);
    if (!superUser || superUser.role !== 'superuser') {
        return res.status(403).json({ error: 'Only superusers can approve quit requests.' });
    }

    try {
        // Find the user who made the quit request
        const user = await User.findById(user_id);

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Check if the user has a pending quit request
        if (!user.quit_request || user.quit_request.status !== 'pending') {
            return res.status(400).json({ error: 'No pending quit request found for this user.' });
        }

        // If the request is approved, either deactivate or delete the user account
        if (approve) {
            if (delete_account) {
                // Permanently delete the user account
                await User.findByIdAndDelete(user_id);

                // Notify the user of account deletion
                const notification = new Notification({
                    to_id: user._id,
                    notification_type: 'Account Deleted',
                    notification: 'Your account has been permanently deleted as per your request.'
                });
                await notification.save();

                res.status(200).json({ message: 'User account has been deleted permanently.' });
            } else {
                // Deactivate the user account (set account_status to false)
                user.account_status = false;   // Deactivate account
                user.quit_request.status = 'approved';  // Mark the quit request as approved
                await user.save();

                // Notify the user of account deactivation
                const notification = new Notification({
                    to_id: user._id,
                    notification_type: 'Account Deactivated',
                    notification: 'Your account has been deactivated. You can reactivate it by logging in again.'
                });
                await notification.save();

                res.status(200).json({ message: 'User account has been deactivated successfully.' });
            }
        } else {
            // If the request is denied
            user.quit_request.status = 'denied';
            await user.save();

            // Notify the user of denial
            const notification = new Notification({
                to_id: user._id,
                notification_type: 'Quit Request Denied',
                notification: 'Your request to quit the account has been denied.'
            });
            await notification.save();

            res.status(200).json({ message: 'User quit request has been denied.' });
        }
    } catch (error) {
        console.error('Error processing quit request approval:', error);
        res.status(500).json({ error: 'Internal server error.', details: error.message });
    }
});

router.get('/get_user_ratings', authMiddleware, async (req, res) => {
    try {
        const { user_id } = req.query;

        // Validate user_id
        if (!user_id) {
            return res.status(400).json({ error: 'User ID is required.' });
        }

        // Validate if user_id is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(user_id)) {
            return res.status(400).json({ error: 'Invalid user ID format.' });
        }

        // Convert user_id to ObjectId using 'new'
        const objectId = new mongoose.Types.ObjectId(user_id);

        // Fetch pending ratings where the user is the buyer or seller
        const pendingRatingsAsBuyer = await Transaction.find({
            buyer_id: objectId,  // Check if user is the buyer
            buyer_rating_given: false, // Ensure no rating is given by the buyer
        }).populate('listing_id', 'name description price_from price_to')
          .exec();

        const pendingRatingsAsSeller = await Transaction.find({
            seller_id: objectId,  // Check if user is the seller
            seller_rating_given: false, // Ensure no rating is given by the seller
        }).populate('listing_id', 'name description price_from price_to')
          .exec();

        // If no pending ratings are found
        if (pendingRatingsAsBuyer.length === 0 && pendingRatingsAsSeller.length === 0) {
            return res.status(404).json({ message: 'No pending ratings found.' });
        }

        // Return the pending ratings
        res.status(200).json({
            message: 'Pending ratings fetched successfully.',
            pendingRatingsAsBuyer,
            pendingRatingsAsSeller,
        });
    } catch (err) {
        console.error('Error fetching pending ratings:', err);
        res.status(500).json({ error: 'Internal server error.', details: err.message });
    }
});





module.exports = router;
