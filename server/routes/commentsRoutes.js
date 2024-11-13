const express = require('express');
const Comment = require('../models/Comments');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/add-comment', authMiddleware, async (req, res) => {
    const { listing_id, comment } = req.body;

    try {
        // Validate that the comment is not too long
        if (!comment || comment.length > 500) {
            return res.status(400).json({ message: 'Comment is too long' });
        }

        // Create the new comment
        const newComment = new Comment({
            listing_id,
            commenter_id: req.user.id, // Get the user ID from the token
            comment
        });

        await newComment.save();

        res.status(201).json({ message: 'Comment added successfully', comment: newComment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error adding comment' });
    }
});

module.exports = router;