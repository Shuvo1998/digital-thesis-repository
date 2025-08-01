// backend/middleware/adminAuth.js
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        if (req.user.role === 'admin' || req.user.role === 'supervisor') {
            next();
        } else {
            res.status(403).json({ msg: 'Access denied. You do not have the required permissions.' });
        }
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};