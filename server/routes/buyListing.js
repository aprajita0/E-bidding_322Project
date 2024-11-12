const express = require('express');
const mongoose = require('mongoose');
const Listing = require('../models/Listing');
const Transaction = require('../models/Transaction'); // Make sure to import the Transaction model
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware'); // Assuming you have this middleware to check for authorization
const router = express.Router();

router.post('/buy', authMiddleware, async (req, res) => {
    const { listing_id } = req.body; // The listing user wants to buy
    try {
        // Find the listing
        const listing = await Listing.findById(listing_id);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        // Find the buyer and check account balance
        const buyer = await User.findById(req.user.id);
        if (parseFloat(buyer.account_balance.toString()) < parseFloat(listing.amount.toString())) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // Create the transaction
        const transaction = new Transaction({
            buyer_id: buyer._id,
            seller_id: listing.user_id, // Seller is the user who created the listing
            listing_id: listing._id,
            amount: listing.amount
        });

        // Deduct the buyer's balance and add to the seller's balance
        buyer.account_balance = mongoose.Types.Decimal128.fromString(
            (parseFloat(buyer.account_balance.toString()) - parseFloat(listing.amount.toString())).toString()
        );

        const seller = await User.findById(listing.user_id);
        seller.account_balance = mongoose.Types.Decimal128.fromString(
            (parseFloat(seller.account_balance.toString()) + parseFloat(listing.amount.toString())).toString()
        );

        await buyer.save();
        await seller.save();

        // Save the transaction
        await transaction.save();

        // Optionally, mark the listing as sold or remove it
        listing.sold = true; // Add a "sold" field to your Listing model if you haven't already
        await listing.save();

        res.status(200).json({ message: 'Transaction completed successfully', transaction });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error processing transaction' });
    }
});

module.exports = router;