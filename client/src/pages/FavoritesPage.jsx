import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHeart, FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import "../Styles/FavoritesPage.css";
import Navbar from "../components/Navbar";
import { logError } from "../util/logger";

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
    const fetchFavoriteBooks = async () => {
      if (!user) {
        setError("User not found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `https://bookcafe2.onrender.com/api/user/${user.id}/favoriteBooks`
        );

        // التأكد أن البيانات مصفوفة
        const favs = Array.isArray(response.data) ? response.data : [];
        setFavorites(favs);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setFavorites([]);
        } else {
          setError("Failed to load favorite books.");
          logError("An error occurred:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteBooks();
  }, [user]);

  const toggleFavorite = async (book) => {
    if (!user) return;
    try {
      const isFavorite = favorites.some((favBook) => favBook.id === book.id);
      const userId = user.id;

      if (isFavorite) {
        await axios.delete(
          `https://bookcafe2.onrender.com/api/user/${user.id}/favoriteBook/${book.id}`
        );
        const updatedFavorites = favorites.filter(
          (favBook) => favBook.id !== book.id
        );
        setFavorites(updatedFavorites);
        localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      } else {
        await axios.post(
          `https://bookcafe2.onrender.com/api/user/${user.id}/favoriteBook`,
          { bookId: book.id }
        );
        const updatedFavorites = [...favorites, book];
        setFavorites(updatedFavorites);
        localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      }
    } catch (err) {
      logError(err);
      alert("Failed to update favorite books.");
    }
  };

  if (loading) return <p>Loading favorite books...</p>;

  return (
    <div className="favorites-page-custom">
      <Navbar />
      <button className="backButton-custom" onClick={() => navigate(-1)}>
        <FaArrowLeft />
      </button>
      <h1>Your Favorite Books</h1>

      {error && <p className="error-message">{error}</p>}

      {!error && (!Array.isArray(favorites) || favorites.length === 0) && (
        <p className="frmes">No favorite books yet 🤷‍♀️ !</p>
      )}

      {!error && Array.isArray(favorites) && favorites.length > 0 && (
        <div className="favorites-grid-custom">
          {favorites.map((book) => (
            <div key={book.id} className="favorite-item-custom">
              <img
                src={book.volumeInfo?.imageLinks?.thumbnail || "/default-image.jpg"}
                alt={book.volumeInfo?.title || "No Title"}
                className="favorite-thumbnail-custom"
              />
              <Link to={`/book/${book.id}`} className="favorite-title-custom">
                {book.volumeInfo?.title || "No Title"}
              </Link>
              <FaHeart
                className={`favorite-heart-custom ${
                  favorites.some((favBook) => favBook.id === book.id) ? "red" : ""
                }`}
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
