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

router.get('/get-visitor-applications', authMiddleware, async (req, res) => {
    try {
        const superUser = await SuperUser.findOne({ user_id: req.user.id });
        if (!superUser) {
            return res.status(403).json({ error: 'Access denied. Only super-users can view visitor applications.' });
        }

        const applications = await Visitor.find({ application_status: 'Pending' }).populate('user_id', 'username email');
        res.status(200).json(applications);
    } catch (error) {
        console.error('Error fetching visitor applications:', error);
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

router.post('/unban-user', authMiddleware, async (req, res) => {
    try {
      const superUser = await User.findById(req.user.id);
      if (!superUser || superUser.role !== 'superuser') {
        return res.status(403).json({ error: 'Access denied. Only super-users can unsuspend users.' });
      }
  
      // Extract the user ID to unsuspend from the request body
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required.' });
      }
  
      // Find the user to be unsuspended
      const userToUnsuspend = await User.findById(userId);
      if (!userToUnsuspend) {
        return res.status(404).json({ error: 'User not found.' });
      }
  
      userToUnsuspend.account_status = true;
      await userToUnsuspend.save();
  
      res.status(200).json({ message: `User ${userToUnsuspend.username} has been unsuspended successfully.` });
    } catch (error) {
      console.error('Error unsuspending user:', error);
      res.status(500).json({ error: 'Server error. Please try again later.' });
    }
  });


module.exports = router;