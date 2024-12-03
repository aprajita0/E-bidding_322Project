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
const RaffleEntries = require('../models/RaffleEntries');
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

router.post('/add-raffle', authMiddleware, async (req, res) => {
    try {
        const { raffle_name, prize, start_date, end_date } = req.body;
        const user = await User.findById(req.user.id);

        if (!raffle_name || !prize || !start_date || !end_date) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        const raffle = new Raffle({
            owner_id: req.user.id,
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
    console.log('User from authMiddleware:', req.user);
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        const raffles = await Raffle.find({ owner_id: { $ne: user._id } });

        res.status(200).json(raffles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

router.get('/get-raffle/:id', async (req, res) => {
    try {
        const raffle = await Raffle.findById(req.params.id);
        if (!raffle) {
            return res.status(404).json({ error: 'Raffle not found.' });
        }

        res.status(200).json(raffle);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});


router.post('/enter-raffle', authMiddleware, async (req, res) => {
    try {
        const { raffle_id } = req.body;
        const user = await User.findById(req.user.id);

        if (!raffle_id) {
            return res.status(400).json({ error: 'Raffle ID is required.' });
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const raffle = await Raffle.findById(raffle_id);
        if (!raffle) {
            return res.status(404).json({ error: 'Raffle not found.' });
        }

        const hasTransaction = await Transaction.findOne({
            buyer_id: user._id,
            seller_id: raffle.owner_id,
        });

        if (!hasTransaction) {
            return res.status(400).json({ error: 'You can only enter raffle if you have bought something from the owner.' });
        }

        const raffleEntry = new RaffleEntries({
            raffle_id: raffle._id,
            user_id: user._id,
        });

        await raffleEntry.save();

        res.status(201).json({ message: 'Raffle entry added successfully', raffleEntry });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

router.post('/win-raffle', authMiddleware, async (req, res) => {
    try {
        const { raffle_id } = req.body;


        if (!raffle_id) {
            return res.status(400).json({ error: 'Raffle ID is required.' });
        }

        const raffle = await Raffle.findById(raffle_id);
        if (!raffle) {
            return res.status(404).json({ error: 'Raffle not found.' });
        }

        const entries = await RaffleEntries.find({ raffle_id });
        if (entries.length === 0) {
            return res.status(404).json({ error: 'No entries found for this raffle.' });
        }

        const winnerIndex = Math.floor(Math.random() * entries.length);
        const winnerEntry = entries[winnerIndex];

        winnerEntry.won_prize = true;
        winnerEntry.won_date = new Date();
        await winnerEntry.save();

        await Raffle.findByIdAndDelete(raffle_id);

        res.status(200).json({
            message: 'Winner selected successfully.',
            winner: {
                user_id: winnerEntry.user_id,
                raffle_id: winnerEntry.raffle_id,
                won_date: winnerEntry.won_date,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

router.get('/get-raffle-entries', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const entries = await RaffleEntries.find({ user_id: user._id });
        if (entries.won_prize === true) {
            return res.status(200).json({ message: 'You have won a prize.' });
        }

        res.status(200).json(entries);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

router.post('/read-status-raffle', authMiddleware, async (req, res) => {
    try {
        const { raffle_id } = req.body;
        const user = await User.findById(req.user.id);

        if (!raffle_id) {
            return res.status(400).json({ error: 'Raffle ID is required.' });
        }

        const entry = await RaffleEntries.findOne({ raffle_id, user_id: user._id });
        
        if (entry.read_status === false) {
            entry.read_status = true;
            await entry.save();
        }
        res.status(200).json({ message: 'Read status updated successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});


module.exports = router;
