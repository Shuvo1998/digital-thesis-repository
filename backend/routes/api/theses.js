// backend/routes/api/theses.js
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const role = require('../../middleware/role'); // Your existing role middleware
const Thesis = require('../../models/Thesis');
const multer = require('multer');
const path = require('path');
const { check, validationResult } = require('express-validator');

// Configure Multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // 'uploads' directory must exist in your backend root
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Give the file a unique name based on the current timestamp
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// Create the Multer upload middleware
const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // 10MB file size limit
    fileFilter: (req, file, cb) => {
        // Only accept PDF files
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed!'), false);
        }
    }
});

// @route   POST api/theses
// @desc    Submit a new thesis
// @access  Private
router.post(
    '/', // CORRECTED: Changed the path to match the frontend call
    auth,
    upload.single('thesisFile'), // CORRECTED: Changed 'file' to 'thesisFile'
    async (req, res) => {
        // Validation check
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            // Check if the file was uploaded
            if (!req.file) {
                return res.status(400).json({ msg: 'No file uploaded. Thesis file is required.' });
            }

            // CORRECTED: Destructure all required fields from req.body
            const { title, abstract, authorName, department, submissionYear, supervisor, keywords } = req.body;

            // CORRECTED: Create a new thesis document with all fields
            const newThesis = new Thesis({
                user: req.user.id,
                title,
                abstract,
                authorName,
                department,
                submissionYear,
                supervisor, // Now included
                keywords: keywords.split(',').map(keyword => keyword.trim()), // Now included and converted to array
                filePath: req.file.path,
                fileName: req.file.originalname, // Using originalname for consistency
            });

            await newThesis.save();

            res.status(201).json(newThesis);

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   GET api/theses/pending
// @desc    Get all pending theses for admin/supervisor dashboard
// @access  Private (Admin & Supervisor only)
// Ensure 'auth' runs before 'role'
router.get('/pending', auth, role(['admin', 'supervisor']), async (req, res) => {
    try {
        const pendingTheses = await Thesis.find({ status: 'pending' }).populate('user', ['username']);
        res.json(pendingTheses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/theses/me
// @desc    Get all theses for the authenticated user
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        // req.user.id is set by the 'auth' middleware
        const userTheses = await Thesis.find({ user: req.user.id });
        res.json(userTheses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/theses/public
// @desc    Get all public and approved theses
// @access  Public
router.get('/public', async (req, res) => {
    try {
        const publicTheses = await Thesis.find({ status: 'approved', isPublic: true });
        res.json(publicTheses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/theses/:id
// @desc    Get a single thesis by ID
// @access  Public (for approved/public theses) or Private (for user/admin)
router.get('/:id', auth, async (req, res) => {
    try {
        const thesis = await Thesis.findById(req.params.id).populate('user', ['username']);

        if (!thesis) {
            return res.status(404).json({ msg: 'Thesis not found' });
        }

        // Check if the thesis is public or if the user has permission to view it
        // req.user is set by the 'auth' middleware
        const isPublic = thesis.status === 'approved' && thesis.isPublic;
        const isOwner = req.user && req.user.id.toString() === thesis.user._id.toString();
        const isAdminOrSupervisor = req.user && (req.user.role === 'admin' || req.user.role === 'supervisor');

        if (isPublic || isOwner || isAdminOrSupervisor) {
            res.json(thesis);
        } else {
            return res.status(403).json({ msg: 'Access denied. You do not have permission to view this thesis.' });
        }
    } catch (err) {
        console.error(err.message);
        // Handle malformed IDs
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Thesis not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/theses/:id/approve
// @desc    Approve a pending thesis
// @access  Private (Admin & Supervisor Only)
// Ensure 'auth' runs before 'role'
router.put('/:id/approve', auth, role(['admin', 'supervisor']), async (req, res) => {
    try {
        const thesis = await Thesis.findById(req.params.id);
        if (!thesis) {
            return res.status(404).json({ message: 'Thesis not found' });
        }

        thesis.status = 'approved';
        await thesis.save();
        res.status(200).json({ message: 'Thesis approved successfully', thesis });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/theses/:id/reject
// @desc    Reject a pending thesis
// @access  Private (Admin & Supervisor Only)
// Ensure 'auth' runs before 'role'
router.put('/:id/reject', auth, role(['admin', 'supervisor']), async (req, res) => {
    try {
        const thesis = await Thesis.findById(req.params.id);
        if (!thesis) {
            return res.status(404).json({ message: 'Thesis not found' });
        }

        thesis.status = 'rejected';
        await thesis.save();
        res.status(200).json({ message: 'Thesis rejected successfully', thesis });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;