import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true 
    },

    email: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true,
      trim: true 
    },

    password: { 
      type: String, 
      required: true 
    },

    // ================= User Roles =================
    role: {
      type: String,
      enum: ["admin", "agent", "customer"],   // customer = normal user
      default: "customer",
    },

    // ================= Login Sessions =================
    // Stores multiple device logins with tokens
    sessions: [
      {
        token: String,
        loginAt: { type: Date, default: Date.now }
      }
    ],
  },

  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
