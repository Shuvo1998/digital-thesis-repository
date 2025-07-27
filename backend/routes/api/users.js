// backend/routes/api/users.js
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

// Middleware imports
const auth = require('../../middleware/auth');
const checkRole = require('../../middleware/role');

// @route   POST api/users
// @desc    Register a new user
// @access  Public
router.post(
    '/',
    [
        check('username', 'Username is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check(
            'password',
            'Please enter a password with 6 or more characters'
        ).isLength({ min: 6 }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password } = req.body;

        try {
            // Check if user exists
            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
            }

            user = new User({
                username,
                email,
                password,
            });

            // Hash password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            await user.save();

            // Create and return a JWT
            const payload = {
                user: {
                    id: user.id,
                    role: user.role,
                },
            };

            jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: '1h' },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                }
            );

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   GET api/users
// @desc    Get all users (for admin management)
// @access  Private (Admin only)
router.get(
    '/',
    [auth, checkRole(['admin'])],
    async (req, res) => {
        try {
            // Find all users and select specific fields for security
            const users = await User.find().select('-password');
            res.json(users);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   PUT api/users/:id/role
// @desc    Update a user's role
// @access  Private (Admin only)
router.put('/:id/role', [auth, checkRole(['admin'])], async (req, res) => {
    try {
        const { role } = req.body;

        // Prevent an admin from changing their own role
        if (req.user.id === req.params.id) {
            return res.status(400).json({ msg: 'You cannot change your own role' });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        user.role = role;
        await user.save();

        // Respond with the updated user data (excluding password)
        const userWithoutPassword = await User.findById(user._id).select('-password');
        res.json(userWithoutPassword);

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.status(500).send('Server Error');
    }
});
// @route   GET api/users/profile
// @desc    Get the profile of the logged-in user
// @access  Private
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
// @route   PUT api/users/profile
// @desc    Update a user's profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
    try {
        const { username, email } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Check if the new email is already in use by another user
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ msg: 'Email is already in use' });
            }
        }

        // Update fields if they are provided
        if (username) user.username = username;
        if (email) user.email = email;

        await user.save();

        // Return the updated user data (excluding password)
        const updatedUser = await User.findById(userId).select('-password');
        res.json(updatedUser);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
module.exports = router;