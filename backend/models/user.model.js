import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Required Identity Fields
    auth0_id: {
      type: String,
      required: [true, "Auth0 ID is required"],
      unique: true,
      index: true,
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      index: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please use a valid email address",
      ],
      lowercase: true,
    },

    // Optional Profile Information
    dp_url: {
      type: String,
      default: "https://via.placeholder.com/150",
      match: [/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i, "Invalid URL format"],
    },
    phoneNumber: {
      type: String,
      required: false,
      validate: {
        validator: (v) => {
          if (!v) return true;
          const cleaned = v.replace(/[\s()-]/g, "").trim();
          return /^\+?[1-9]\d{1,14}$/.test(cleaned);
        },
        message: (props) =>
          `${props.value} is not a valid international phone number!`,
      },
    },

    // Application State
    profile_complete: {
      type: Boolean,
      default: false,
    },
    dogsListed: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Dog",
        default: [],
      },
    ],
  },
  {
    collection: "users",
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for search optimization
userSchema.index({
  username: "text",
  email: "text",
});

// Model Methods (example)
userSchema.methods.getPublicProfile = function () {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    dp_url: this.dp_url,
    dogsListed: this.dogsListed,
  };
};

const User = mongoose.model("User", userSchema);

export default User;
