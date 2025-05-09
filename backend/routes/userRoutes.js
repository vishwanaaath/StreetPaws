import express from "express";
import User from "../models/user.model.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const router = express.Router(); 
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);
 
router.post("/users", async (req, res) => {
  try {
    const userData = req.body;
 
    if (!userData.auth0_id || !userData.email) {
      return res.status(400).json({ message: "Missing required fields" });
    }
 
    const newUser = new User({
      ...userData,
      profile_complete: true,
    });

    await newUser.save();

    res.status(201).json({
      message: "Profile created successfully",
      user: newUser.toObject({ virtuals: true }),
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        message: `User with this ${field} already exists`,
        field: field,
      });
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: messages.join(", ") });
    }

    console.error("Server error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


router.get("/users", async (req, res) => {
  try {
    console.log("Handling GET /api/users");  
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});
 
router.get("/users/:numericId", async (req, res) => {
  try {
    const numericId = req.params.numericId;
    const user = await User.findOne({
      auth0_id: numericId,
    });

    if (!user)
      return res.status(404).json({
        message: "User not found",
        numericId,
      });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

 
router.get("/users/mongo/:mongoId", async (req, res) => {
  try {
    const mongoId = req.params.mongoId; 
    if (!mongoose.Types.ObjectId.isValid(mongoId)) {
      return res.status(400).json({
        message: "Invalid MongoDB ID format",
        receivedId: mongoId,
      });
    }

    const user = await User.findById(mongoId);

    if (!user)
      return res.status(404).json({
        mongoId,
        message: "User not found with this MongoDB ID",
      });

    res.json(user);
  } catch (error) {
    console.error("MongoDB ID lookup error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/list-avatars", async (req, res) => {
  const { data } = await supabase.storage.from("avatars").list("Profilepic");
  res.json(data);
});

router.delete("/delete-avatar", async (req, res) => {
  try {
    const { fileName } = req.body; 
    const { data, error } = await supabase.storage
      .from("avatars") 
      .remove([`Profilepic/${fileName}`]); 

    if (error) throw error;
    res.status(200).json({ message: "Avatar deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Error deleting avatar" });
  }
});
 
router.patch("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { dp_url: req.body.dp_url },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error updating user" });
  }
});

export default router;
