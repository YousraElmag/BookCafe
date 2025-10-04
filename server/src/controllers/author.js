/* eslint-disable no-console */
import User from "../models/User.js";
export const saveUserFavoriteAuthor = async (req, res) => {
  try {
    console.log("User from request:", req.user);
    console.log("Request body:", req.body);

    const userId = req.params.id;
    const { author } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.favoriteAuthors.includes(author)) {
      user.favoriteAuthors.push(author);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Author saved successfully!",
      favoriteAuthors: user.favoriteAuthors,
    });
  } catch (error) {
    console.error("Error in saveUserFavoriteAuthor:", error);
    res.status(500).json({
      success: false,
      msg: "Unable to save author, please try again later.",
    });
  }
};
