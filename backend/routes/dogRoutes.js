import mongoose from "mongoose"; 
import express from "express";
import Dog from "../models/dog.model.js"; 
import User from "../models/user.model.js";
const router = express.Router();  
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

router.post("/", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const dogData = req.body;
  if (
    !dogData.location?.coordinates ||
    !Array.isArray(dogData.location.coordinates) ||
    dogData.location.coordinates.length !== 2 ||
    typeof dogData.location.coordinates[0] !== "number" || 
    typeof dogData.location.coordinates[1] !== "number"
  ) {
    return res.status(400).json({
      message: "Coordinates must be an array of [longitude, latitude] numbers",
    });
  } 
    if (
      !dogData.listerId ||
      !mongoose.Types.ObjectId.isValid(dogData.listerId)
    ) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Invalid lister ID" });
    }
 
    const userExists = await User.exists({ _id: dogData.listerId }).session(
      session
    );
    if (!userExists) {
      await session.abortTransaction();
      return res.status(404).json({ message: "User not found" });
    }
 
    const newDog = new Dog(dogData);
    const savedDog = await newDog.save({ session });
 
    const updatedUser = await User.findByIdAndUpdate(
      dogData.listerId,
      { $push: { dogsListed: savedDog._id } },
      { new: true, session }
    ).populate("dogsListed");

    await session.commitTransaction();

    res.status(201).json({
      message: "Dog listing created successfully",
      dog: savedDog,
      user: updatedUser,
    });
  } catch (error) {
    await session.abortTransaction();

    if (error.name === "CastError") {
      return res.status(400).json({
        message: `Invalid ID format: ${error.value}`,
      });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: messages.join(", ") });
    }

    if (error.code === 11000) {
      return res.status(409).json({ message: "Duplicate dog listing" });
    }

    console.error("Dog creation error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  } finally {
    session.endSession();
  }
});


router.get("/", async (req, res) => {
  try {
    const dogs = await Dog.find()
      .populate({
        path: "listerId",
        select: "username email dp_url",
        model: "User", 
      })
      .lean();
 
    const formattedDogs = dogs.map((dog) => ({
      ...dog,
      _id: dog._id.toString(),
      listerId: dog.listerId?._id.toString(),
      lister: dog.listerId
        ? {
            username: dog.listerId.username,
            email: dog.listerId.email,
            dp_url: dog.listerId.dp_url,
          }
        : null,
    }));

    res.json(formattedDogs);
  } catch (error) {
    console.error("Error fetching dogs:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

router.get("/by-ids", async (req, res) => {
  try {
    const { ids } = req.query;

    if (!ids) {
      return res.status(400).json({ message: "Missing dog IDs" });
    }
 
    const idArray = ids.split(",");
    const invalidIds = idArray.filter(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );

    if (invalidIds.length > 0) {
      return res.status(400).json({
        message: "Invalid ObjectIDs detected",
        invalidIds,
      });
    }

    const dogIds = idArray.map((id) => new mongoose.Types.ObjectId(id));

    const dogs = await Dog.find({
      _id: { $in: dogIds },
    }).populate({
      path: "listerId",
      select: "username dp_url",
      model: "User",
    });

    const formattedDogs = dogs.map((dog) => ({
      ...dog.toObject(),
      _id: dog._id.toString(),
      lister: dog.listerId
        ? {
            username: dog.listerId.username,
            dp_url: dog.listerId.dp_url,
          }
        : null,
    }));

    res.json(formattedDogs);
  } catch (error) {
    console.error("Error fetching dogs by IDs:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}); 

router.delete("/:dogId", async (req, res) => {
  try { 
    if (!mongoose.Types.ObjectId.isValid(req.params.dogId)) {
      return res.status(400).json({ message: "Invalid dog ID format" });
    }
 
    const deletedDog = await Dog.findByIdAndDelete(req.params.dogId).lean();

    if (!deletedDog) {
      return res.status(404).json({ message: "Dog not found" });
    }
 
     await User.findByIdAndUpdate(
       deletedDog.listerId,
       { $pull: { dogsListed: deletedDog._id } },
       { new: true }
     );
 
    try {
      await supabase.storage
        .from("bucket1")
        .remove([`uploads/${deletedDog.imageUrl}`]);
    } catch (storageError) {
      console.error("Supabase cleanup error:", storageError);
    }

    res.json({
      message: "Dog deleted successfully",
      deletedDog,
    });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});


export default router;
