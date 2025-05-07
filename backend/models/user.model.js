import mongoose from "mongoose";

// Improved User Schema

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
      lowercase: true,
    },
    auth0_id: {
      type: String,
      required: [true, "Auth0 ID is required"],
      unique: true,
      index: true,
    },
    dp_url: {
      type: String,
      required: [true, "Profile picture URL is required"],
      match: [/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i, "Invalid URL format"],
    },
    phoneNumber: {
      type: String,
      validate: {
        validator: (v) => /^\+?[1-9]\d{1,14}$/.test(v.replace(/[\s()-]/g, "")), // E.164 format support
        message: (props) =>
          `${props.value} is not a valid international phone number!`,
      },
    },
    profile_complete: {
      type: Boolean,
      default: false, // Changed to false by default
    },
    dogsListed: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Dog",
        default: [],
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "users",
  }
);

const User = mongoose.model("User", userSchema);

export default User;
