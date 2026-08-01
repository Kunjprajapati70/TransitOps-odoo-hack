const express = require('express');
const router = express.Router();
const { getNotifications, getUnreadCount, markAsRead, markAllRead, deleteNotification } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.get('/unread-count', protect, getUnreadCount);
router.get('/', protect, getNotifications);
router.put('/:id/read', protect, markAsRead);
router.post('/read-all', protect, markAllRead);
router.delete('/:id', protect, deleteNotification);

module.exports = router;
