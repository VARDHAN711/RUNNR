import mongoose, { Schema, model } from 'mongoose';
import { INotification } from '../types/interfaces';
import { NotificationType } from '../types/enums';

const notificationSchema = new Schema<INotification>({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Recipient ID is required"],
  },
  message: {
    type: String,
    required: [true, "Message is required"],
    trim: true,
  },
  type: {
    type: String,
    enum: Object.values(NotificationType),
    required: [true, "Notification type is required"],
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default model<INotification>("Notification", notificationSchema);
