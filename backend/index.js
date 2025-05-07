import express from "express";
import mongoose from "mongoose"; 
import multer from "multer";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv"; 
// Load models before routes
import "./models/user.model.js";
import "./models/dog.model.js";
import userRouter from "./routes/userRoutes.js";
import dogRouter from "./routes/dogRoutes.js";


dotenv.config();

const app = express();
 
const upload = multer({ storage: multer.memoryStorage() });

// Database connection
// Updated MongoDB connection (remove deprecated options)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas!'))
  .catch(err => console.error('MongoDB connection error:', err));

  // Add this to your connection code
mongoose.connection.on('connected', () => {
  console.log(`Connected to database: ${mongoose.connection.db.databaseName}`);
});
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

// Supabase configuration
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Middleware
app.use(cors({
  origin: '*',  // Or specify specific origins if needed
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Ensure OPTIONS is allowed
}));
app.use(express.json());
app.use("/api", userRouter);
app.use("/api/dogs", dogRouter);


app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.originalUrl);
  next();
});

app.get("/test", (req, res) => {
  res.json({msg: "yo"});
});


// File upload endpoints
app.post("/upload-avatar", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(
        `Profilepic/${Date.now()}-${req.file.originalname}`,
        req.file.buffer,
        {
          contentType: req.file.mimetype,
          cacheControl: "3600",
        }
      );

    if (error) {
      console.error("Supabase upload error:", error);
      return res.status(500).json({ error: "File upload failed" });
    }

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(data.path);

    res.json({ downloadUrl: urlData.publicUrl });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { data, error } = await supabase.storage
      .from("bucket1")
      .upload(
        `uploads/${Date.now()}-${req.file.originalname}`,
        req.file.buffer,
        {
          contentType: req.file.mimetype,
          cacheControl: "3600",
        }
      );

    if (error) {
      console.error("Supabase upload error:", error);
      return res.status(500).json({ error: "File upload failed" });
    }

    const { data: urlData } = supabase.storage
      .from("bucket1")
      .getPublicUrl(data.path);

    res.json({ downloadUrl: urlData.publicUrl });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// In your backend server.js/index.js
app.listen(5000, () => {
  console.log('HTTP Server running on port 5000');
});