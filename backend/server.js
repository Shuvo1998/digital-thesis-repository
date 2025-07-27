require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();

connectDB();

app.use(express.json({ extended: false }));
app.use(cors());

// Define API routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/theses', require('./routes/api/theses')); // New line for theses routes

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));