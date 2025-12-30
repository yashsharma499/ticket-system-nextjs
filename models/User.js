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

    
    role: {
      type: String,
      enum: ["admin", "agent", "customer"],   // customer = normal user
      default: "customer",
    },

    
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
