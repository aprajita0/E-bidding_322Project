const express = require('express');
const Complaint = require('../models/Complaints'); // Import the Complaint model
const { authMiddleware } = require('../middleware/authMiddleware'); // Import the authMiddleware if you have one
const router = express.Router();

// Route to create a complaint
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

// Route to get all complaints for a user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const complaints = await Complaint.find({ complainer_id: req.user.id }).populate('subject_id', 'name'); // Optionally populate subject_id with listing or transaction info
        res.status(200).json({ complaints });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error retrieving complaints', details: err.message });
    }
});

// Route to resolve or dismiss a complaint (only for admin or appropriate user)
router.put('/:id', authMiddleware, async (req, res) => {
    const { complaint_status, date_resolved } = req.body;
    try {
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found' });
        }

        if (complaint.complainer_id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to update this complaint' });
        }

        complaint.complaint_status = complaint_status;
        complaint.date_resolved = date_resolved ? new Date(date_resolved) : null;

        await complaint.save();

        res.status(200).json({ message: 'Complaint updated successfully', complaint });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error updating complaint', details: err.message });
    }
});

// Route to delete a complaint (if needed, for the complainer or admin)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found' });
        }

        if (complaint.complainer_id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to delete this complaint' });
        }

        await complaint.remove();
        res.status(200).json({ message: 'Complaint deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error deleting complaint', details: err.message });
    }
});

module.exports = router;
