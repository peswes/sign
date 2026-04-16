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

    phone: {
      type: String,
      required: true
    },

    course: {
      type: String,
      required: true
    },

    password: {
      type: String,
      required: true
    },

    referralCode: {
      type: String,
      default: null,
      uppercase: true
    },

    accessType: {
      type: String,
      default: "free"
    },

    isVerified: {
      type: Boolean,
      default: false
    },

    // 🔐 PASSWORD RESET FIELDS
    resetToken: {
      type: String,
      default: null
    },

    resetTokenExpiry: {
      type: Date,
      default: null
    },

    // ⏱️ RATE LIMIT FIELD (NEW)
    resetRequestedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);