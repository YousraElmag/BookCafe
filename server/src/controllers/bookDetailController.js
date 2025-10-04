/* eslint-disable no-console */
// controllers/bookController.js
import axios from "axios";

export const getBookDetail = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes/${id}`,
    );
    res.json(response.data);
  } catch (error) {
    // console.error("Error fetching book details:", error);
    res.status(500).json({ error: "Failed to fetch book details" });
  }
};
