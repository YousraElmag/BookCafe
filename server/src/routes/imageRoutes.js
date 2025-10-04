// routes/imageRoutes.js
import express from "express"; // Import express
import multer from "multer"; // Import multer for handling file uploads
import {
  uploadProfileImage,
  getUserProfile,
} from "../controllers/imageController.js"; // Import controller functions
import { ensureAuthenticated } from "../middleware/authMiddleware.js"; // Import authentication middleware
import path from "path"; // Import path module for file paths
const imageRoutes = express.Router(); // Create a new router instance

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/", // Temporary directory for storing uploaded files
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit files to 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/; // Allowed file types
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase(),
    );

    if (mimetype && extname) {
      return cb(null, true); // Accept the file
    }
    cb(
      "Error: File upload only supports the following filetypes - " + filetypes,
    ); // Reject the file
  },
});

// Route to handle image uploads
imageRoutes.post(
  "/upload",
  ensureAuthenticated,
  upload.single("profileImage"),
  uploadProfileImage,
);
imageRoutes.get("/", ensureAuthenticated, getUserProfile);

export default imageRoutes; // Export the router
