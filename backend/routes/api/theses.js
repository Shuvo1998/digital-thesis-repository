const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');
const Thesis = require('../../models/Thesis');
const multer = require('multer');
const path = require('path');

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

// @route   GET api/theses/pending
// @desc    Get all pending theses for admin/supervisor dashboard
// @access  Private (Admin & Supervisor only)
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

// @route   POST api/theses/submit
// @desc    Submit a new thesis
// @access  Private
router.post('/submit', auth, upload.single('file'), async (req, res) => {
    try {
        // Check if the file was uploaded
        if (!req.file) {
            return res.status(400).json({ msg: 'No file uploaded' });
        }

        // Access other form data (metadata) from req.body
        const { title, abstract, authorName, department, submissionYear } = req.body;

        // Create a new thesis document
        const newThesis = new Thesis({
            user: req.user.id,
            title,
            abstract,
            authorName,
            department,
            submissionYear,
            filePath: req.file.path,
            fileName: req.file.filename,
        });

        await newThesis.save();

        res.json(newThesis);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;