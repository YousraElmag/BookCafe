/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../Styles/BookRecommendationPage.css";
import Navbar from "../components/Navbar";
import { FavoriteContext } from "../context/FavoriteContext";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    isVisible && (
      <button className="scroll-to-top" onClick={scrollToTop}>
        ↑
      </button>
    )
  );
};

const BookRecommendationPage = () => {
  const [booksByPreference, setBooksByPreference] = useState({});
  const [booksByFavoriteAuthors, setBooksByFavoriteAuthors] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userPreferences, setUserPreferences] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const { favorites, toggleFavorite } = useContext(FavoriteContext);
  const navigate = useNavigate();

  // Fetch user preferences from API
  const fetchUserPreferences = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!user || !token) {
      setError("User not authenticated. Please log in.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `https://bookcafe2.onrender.com/api/user/${user.id}/preferences`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data && Array.isArray(response.data.preferences)) {
        setUserPreferences(response.data.preferences);
      } else {
        setError("User preferences not found or invalid.");
        setUserPreferences([]);
      }
    } catch (err) {
      console.error("Error fetching preferences:", err);
      setError("Failed to fetch user preferences.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch books for each preference query
  const fetchBooksForPreferences = async () => {
    if (!Array.isArray(userPreferences) || userPreferences.length === 0) return;

    setLoading(true);

    try {
      const fetchPromises = userPreferences.map((preference) => {
        const currentBooks = booksByPreference[preference] || [];
        const startIndex = currentBooks.length;
        const getRandomNumber = () => {
          return Math.floor(Math.random() * 10) + 1;
        };

        return axios
          .get(`https://bookcafe2.onrender.com/api/recommendedBooks`, {
            params: {
              preference,
              startIndex: getRandomNumber(),
            },
          })
          .then((response) => ({
            preference,
            books: Array.isArray(response.data) ? response.data : [],
          }));
      });

      const results = await Promise.all(fetchPromises);

      const newBooksByPreference = results.reduce(
        (acc, { preference, books }) => {
          if (books.length === 0) {
            setHasMore(false);
          }
          acc[preference] = [...(acc[preference] || []), ...books];
          return acc;
        },
        { ...booksByPreference },
      );

      setBooksByPreference(newBooksByPreference);
    } catch (error) {
      console.error("Error fetching books:", error);
      setError("Error fetching books.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBooksByFavoriteAuthors = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!user || !token) {
      setError("User not authenticated. Please log in.");
      return;
    }

    try {
      const response = await axios.get(
        `https://bookcafe2.onrender.com/api/user/${user.id}/favoriteAuthors`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setBooksByFavoriteAuthors(
        Array.isArray(response.data) ? response.data : [],
      );
    } catch (err) {
      console.error("Error fetching favorite authors:", err);
      setError("Failed to fetch books by favorite authors.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch user preferences once on component mount
  useEffect(() => {
    fetchUserPreferences();
    fetchBooksByFavoriteAuthors();
  }, []);

  // Fetch books whenever preferences or page changes
  useEffect(() => {
    if (userPreferences.length > 0) {
      fetchBooksForPreferences();
    }
  }, [userPreferences, page]);

  // Function to save the favorite author
  const handleSaveAuthor = async (author) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!user || !token) {
      setError("User not authenticated. Please log in.");
      return;
    }

    try {
      const response = await axios.put(
        `https://bookcafe2.onrender.com/api/user/${user.id}/favoriteAuthors`,
        { author },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log("Save Author Response:", response.data);
    } catch (error) {
      console.error(
        "Failed to save author:",
        error.response ? error.response.data : error.message,
      );
      setError("Failed to save author.");
    }
  };

  const handleFavoriteSubmit = async (book) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!user || !token) {
      setError("User not authenticated. Please log in.");
      return;
    }

    try {
      const author =
        book.volumeInfo.authors && book.volumeInfo.authors.length > 0
          ? book.volumeInfo.authors[0]
          : null;

      if (author) {
        handleSaveAuthor(author);
      } else {
        console.warn("No authors found for the book:", book);
      }

      const response = await axios.post(
        `https://bookcafe2.onrender.com/api/user/${user.id}/favoriteBook`,
        { bookId: book.id },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log("Book saved to favorites:", response.data);
    } catch (err) {
      console.error(
        "Failed to save favorite book:",
        err.response ? err.response.data : err.message,
      );
      setError("Failed to save favorite book.");
    }
  };

  if (loading && page === 1) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="book-page">
      <Navbar />
      {booksByFavoriteAuthors.length > 0 && (
        <div className="book-category">
          <h2>Books by Your Favorite Authors</h2>
          <div className="book-grid">
            {booksByFavoriteAuthors.map((book) => {
              const isFavorite = favorites.some(
                (favBook) => favBook.id === book.id,
              );
              return (
                <div key={book.id} className="book-item">
                  <p className="authorname">{book.volumeInfo.authors[0]}</p>
                  <button
                    className="heart-icon"
                    onClick={() => {
                      toggleFavorite({
                        id: book.id,
                        title: book.volumeInfo.title,
                        imageLinks: book.volumeInfo.imageLinks,
                        description: book.volumeInfo.description,
                      });
                      handleFavoriteSubmit(book);
                    }}
                    style={{ color: isFavorite ? "red" : "white" }}
                  >
                    ♥
                  </button>
                  {book.volumeInfo.imageLinks?.thumbnail ? (
                    <img
                      src={book.volumeInfo.imageLinks.thumbnail}
                      alt={book.volumeInfo.title}
                      className="book-thumbnail"
                    />
                  ) : (
                    <div className="placeholder-cover">
                      <p className="book-title">{book.volumeInfo.title}</p>
                      <p className="book-author">
                        {book.volumeInfo.authors.join(", ") || "Unknown Author"}
                      </p>
                    </div>
                  )}
                  <Link to={`/book/${book.id}`} className="book-title">
                    {book.volumeInfo.title}
                  </Link>
                  <div className="book-info">
                    {book.volumeInfo.description
                      ? book.volumeInfo.description.slice(0, 100) + "..."
                      : "No description available."}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {Object.keys(booksByPreference).map((preference) => (
        <div key={preference} className="book-category">
          <h2>Best {preference} Books</h2>
          <div className="book-grid">
            {booksByPreference[preference].length > 0 ? (
              booksByPreference[preference].map((book) => {
                const isFavorite = favorites.some(
                  (favBook) => favBook.id === book.id,
                );
                return (
                  <div key={book.id} className="book-item">
                    <button
                      className="heart-icon"
                      onClick={() => {
                        toggleFavorite({
                          id: book.id,
                          title: book.volumeInfo.title,
                          imageLinks: book.volumeInfo.imageLinks,
                          description: book.volumeInfo.description,
                        });
                        handleFavoriteSubmit(book);
                      }}
                      style={{ color: isFavorite ? "red" : "white" }}
                    >
                      ♥
                    </button>
                    <Link to={`/book/${book.id}`}>
                      {book.volumeInfo.imageLinks?.thumbnail ? (
                        <img
                          src={book.volumeInfo.imageLinks.thumbnail}
                          alt={book.volumeInfo.title}
                          className="book-thumbnail"
                          style={{ cursor: "pointer" }}
                        />
                      ) : (
                        <div
                          className="placeholder-cover"
                          style={{ cursor: "pointer" }}
                        >
                          <p className="book-title">{book.volumeInfo.title}</p>
                          <p className="book-author">
                            {book.volumeInfo.authors
                              ? book.volumeInfo.authors.join(", ")
                              : "Unknown Author"}
                          </p>
                        </div>
                      )}
                    </Link>
                    <Link to={`/book/${book.id}`} className="book-title">
                      {book.volumeInfo.title}
                    </Link>
                    <div className="book-info">
                      {book.volumeInfo.description
                        ? book.volumeInfo.description.slice(0, 100) + "..."
                        : "No description available."}
                    </div>
                  </div>
                );
              })
            ) : (
              <p>No books available for this preference.</p>
            )}
          </div>
        </div>
      ))}
      {/* Scroll To Top Button */}
      <ScrollToTopButton />
    </div>
  );
};

export default BookRecommendationPage;
