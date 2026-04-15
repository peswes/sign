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
      // NOTE: will be hashed later with bcrypt (VERY IMPORTANT)
    },

    referralCode: {
      type: String,
      default: null,
      uppercase: true
    },

    accessType: {
      type: String,
      default: "free" // free, paid, premium
    },

    isVerified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);