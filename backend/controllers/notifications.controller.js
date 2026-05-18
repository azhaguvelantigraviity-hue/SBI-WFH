const Notification = require('../models/Notification');

// ─── @GET /api/notifications ───────────────────────────────────────────────
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: notifications,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── @PATCH /api/notifications/mark-read ────────────────────────────────────
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.body;

    if (id) {
      // Mark a single notification as read
      await Notification.findOneAndUpdate(
        { _id: id, user: req.user._id },
        { read: true }
      );
    } else {
      // Mark all notifications for this user as read
      await Notification.updateMany(
        { user: req.user._id, read: false },
        { read: true }
      );
    }

    res.json({
      success: true,
      message: 'Notifications updated successfully',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
