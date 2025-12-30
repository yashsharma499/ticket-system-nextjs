import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // unified naming
  message: { type: String, required: true },
  link: { type: String }, // e.g. /tickets/123
  read: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
