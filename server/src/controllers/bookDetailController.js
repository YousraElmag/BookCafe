import axios from "axios";

export const getBookDetail = async (req, res) => {
  const { id } = req.params;

  try {
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes/${id}`,
      {
        params: {
          key: process.env.API_KEY,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(
      "Google Books detail error:",
      error.response?.status,
      error.response?.data || error.message
    );

    res.status(error.response?.status || 500).json({
      error: "Failed to fetch book details",
    });
  }
};