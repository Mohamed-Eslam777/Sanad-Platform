const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const requestRoutes = require('./requestRoutes');
const messageRoutes = require('./messageRoutes');
const reviewRoutes = require('./reviewRoutes');
const sosRoutes = require('./sosRoutes');
const adminRoutes = require('./adminRoutes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/requests', requestRoutes);
router.use('/messages', messageRoutes);
router.use('/reviews', reviewRoutes);
router.use('/sos', sosRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
