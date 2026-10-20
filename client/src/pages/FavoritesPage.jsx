
import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHeart, FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import "../Styles/FavoritesPage.css";
import Navbar from "../components/Navbar";
import { logError } from "../util/logger";

const API_URL = "https://bookcafe2.onrender.com/api";

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchFavoriteBooks = async () => {
      if (!user?.id) {
        setError("User not found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get saved favorite books from MongoDB
        const response = await axios.get(
          `${API_URL}/user/${user.id}/favoriteBooks`
        );

        const savedFavorites = Array.isArray(response.data)
          ? response.data
          : [];

        // Support both book IDs and book objects
        const bookIds = [
          ...new Set(
            savedFavorites
              .map((book) =>
                typeof book === "string" ? book : book?.id
              )
              .filter(Boolean)
          ),
        ];

        // Fetch full details for each saved book
        const books = await Promise.all(
          bookIds.map(async (bookId) => {
            try {
              const bookResponse = await axios.get(
                `${API_URL}/book/detail/${encodeURIComponent(bookId)}`
              );

              return bookResponse.data;
            } catch (err) {
              logError("Failed to fetch book:", bookId, err);

              // Keep the book in favorites if details fail
              const savedBook = savedFavorites.find(
                (book) =>
                  (typeof book === "string" ? book : book?.id) ===
                  bookId
              );

              return {
                id: bookId,
                volumeInfo:
                  typeof savedBook === "object"
                    ? savedBook.volumeInfo || {}
                    : {},
              };
            }
          })
        );

        if (!cancelled) {
          setFavorites(books);
        }
      } catch (err) {
        if (!cancelled) {
          if (err.response?.status === 404) {
            setFavorites([]);
          } else {
            setError("Failed to load favorite books.");
            logError("An error occurred:", err);
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchFavoriteBooks();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const toggleFavorite = async (book) => {
    if (!user?.id) return;

    try {
      await axios.delete(
        `${API_URL}/user/${user.id}/favoriteBook/${book.id}`
      );

      const updatedFavorites = favorites.filter(
        (favBook) => favBook.id !== book.id
      );

      setFavorites(updatedFavorites);

      const storedFavorites = JSON.parse(
        localStorage.getItem("favorites") || "[]"
      );

      if (Array.isArray(storedFavorites)) {
        localStorage.setItem(
          "favorites",
          JSON.stringify(
            storedFavorites.filter(
              (favBook) => favBook.id !== book.id
            )
          )
        );
      }
    } catch (err) {
      logError("Failed to remove favorite:", err);
      alert("Failed to remove favorite book.");
    }
  };

  if (loading) {
    return (
      <div className="favorites-page-custom">
        <Navbar />
        <p>Loading favorite books...</p>
      </div>
    );
  }

  return (
    <div className="favorites-page-custom">
      <Navbar />

      <button
        className="backButton-custom"
        onClick={() => navigate(-1)}
      >
        <FaArrowLeft />
      </button>

      <h1>Your Favorite Books</h1>

      {error && <p className="error-message">{error}</p>}

      {!error && favorites.length === 0 && (
        <p className="frmes">No favorite books yet 🤷‍♀️ !</p>
      )}

      {!error && favorites.length > 0 && (
        <div className="favorites-grid-custom">
          {favorites.map((book) => (
            <div
              key={book.id}
              className="favorite-item-custom"
            >
              <img
                src={
                  book.volumeInfo?.imageLinks?.thumbnail?.replace(
                    /^http:/,
                    "https:"
                  ) || "/default-image.jpg"
                }
                alt={book.volumeInfo?.title || "No Title"}
                className="favorite-thumbnail-custom"
              />

              <Link
                to={`/book/${book.id}`}
                className="favorite-title-custom"
              >
                {book.volumeInfo?.title || "No Title"}
              </Link>

              <FaHeart
                className="favorite-heart-custom red"
                onClick={() => toggleFavorite(book)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
