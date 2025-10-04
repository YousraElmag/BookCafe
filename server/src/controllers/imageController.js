// controllers/imageController.js
import User from "../models/User.js"; // Import the User model
import { uploadImage } from "../services/cloudinaryService.js"; // Import the Cloudinary upload function
import fs from "fs"; // File system module for file operations
import path from "path"; // Path module for handling file paths
import { logError } from "../util/logging.js";

const uploadProfileImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    // Upload the image to Cloudinary
    const imageUrl = await uploadImage(req.file);

    // Get the user ID from the request object
    const userId = req.user.id; // Assuming user ID is stored in req.user after authentication

    // Update the user's profile image URL in the database
    const user = await User.findByIdAndUpdate(
      userId,
      { profileImage: imageUrl },
      { new: true },
    );

    // Cleanup the local file after the upload
    fs.unlink(path.join(req.file.path), (err) => {
      if (err) {
        logError("Failed to delete local file: ", err);
      }
    });

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    // Fetch the user by ID
    const user = await User.findById(req.user.id); // Assuming user ID is stored in req.user after authentication

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export { uploadProfileImage, getUserProfile };
