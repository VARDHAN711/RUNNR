import { Request, Response } from 'express';
import Notification from '../models/Notification';

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get all notifications for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 *       500:
 *         description: Server error
 */
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user!.userId })
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: notifications });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     summary: Get the count of unread notifications
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Unread notification count
 *       500:
 *         description: Server error
 */
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const count = await Notification.countDocuments({
      recipientId: req.user!.userId,
      isRead: false,
    });

    return res.status(200).json({ success: true, data: count });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       403:
 *         description: Access denied
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Server error
 */
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    if (notification.recipientId.toString() !== req.user!.userId) {
      return res.status(403).json({ success: false, message: "Access denied: you do not own this notification" });
    }

    notification.isRead = true;
    await notification.save();

    return res.status(200).json({ success: true, data: notification });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
