// Ensure correct indentation, spaces between braces, and consistent formatting
import User from "../models/User.js";
import { logInfo } from "../util/logging.js";

export const saveUserCategories = async (req, res) => {
  try {
    const { categories } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated." });
    }

    const user = await User.findById(req.user._id);
    user.preferences = categories;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Categories saved successfully!",
      categories: user.preferences,
    });
  } catch (error) {
    logInfo("Error in saveUserCategories:", error);
    res.status(500).json({
      success: false,
      msg: "Unable to save categories, please try again later.",
    });
  }
};
