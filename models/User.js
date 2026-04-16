// import mongoose from "mongoose";

// const UserSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true
//     },

//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true
//     },

//     phone: {
//       type: String,
//       required: true
//     },

//     course: {
//       type: String,
//       required: true
//     },

//     password: {
//       type: String,
//       required: true
//     },

//     referralCode: {
//       type: String,
//       default: null,
//       uppercase: true
//     },

//     accessType: {
//       type: String,
//       default: "free"
//     },

//     isVerified: {
//       type: Boolean,
//       default: false
//     },

//     // 🔐 PASSWORD RESET FIELDS
//     resetToken: {
//       type: String,
//       default: null
//     },

//     resetTokenExpiry: {
//       type: Date,
//       default: null
//     },

//     // ⏱️ RATE LIMIT FIELD (NEW)
//     resetRequestedAt: {
//       type: Date,
//       default: null
//     }
//   },
//   {
//     timestamps: true
//   }
// );

// export default mongoose.models.User || mongoose.model("User", UserSchema);



import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    /* =========================
       BASIC INFO
    ========================= */
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

    /* =========================
       LEARNING SYSTEM (IMPORTANT FIX)
       replaced "course" → "track"
    ========================= */
    track: {
      type: String,
      required: true,
      enum: ["frontend", "ai", "design", "cyber"],
      default: "frontend"
    },

    /* =========================
       AUTH
    ========================= */
    password: {
      type: String,
      required: true
    },

    /* =========================
       REFERRAL SYSTEM
    ========================= */
    referralCode: {
      type: String,
      default: null,
      uppercase: true,
      trim: true
    },

    accessType: {
      type: String,
      enum: ["free", "premium", "pro"],
      default: "free"
    },

    /* =========================
       VERIFICATION SYSTEM
    ========================= */
    isVerified: {
      type: Boolean,
      default: false
    },

    /* =========================
       PASSWORD RESET SYSTEM
    ========================= */
    resetToken: {
      type: String,
      default: null
    },

    resetTokenExpiry: {
      type: Date,
      default: null
    },

    resetRequestedAt: {
      type: Date,
      default: null
    },

    /* =========================
       PROGRESS TRACKING (NEW UPGRADE)
    ========================= */
    progress: {
      type: Object,
      default: {
        frontend: 0,
        ai: 0,
        design: 0,
        cyber: 0
      }
    },

    /* =========================
       LAST LOGIN (NEW)
    ========================= */
    lastLogin: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

/* =========================
   EXPORT MODEL (Vercel Safe)
========================= */
export default mongoose.models.User || mongoose.model("User", UserSchema);