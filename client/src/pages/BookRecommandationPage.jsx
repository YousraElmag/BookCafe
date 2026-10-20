
 
/* eslint-disable no-console */

import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
} from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../Styles/BookRecommendationPage.css";
import Navbar from "../components/Navbar";
import { FavoriteContext } from "../context/FavoriteContext";

const API = "https://bookcafe2.onrender.com";

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", onScroll);
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <button
      className="scroll-to-top"
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        })
      }
    >
      ↑
    </button>
  );
};

const BookRecommendationPage = () => {
  const [booksByPreference, setBooksByPreference] = useState({});
  const [booksByFavoriteAuthors, setBooksByFavoriteAuthors] =
    useState([]);
  const [userPreferences, setUserPreferences] = useState([]);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [authorsLoading, setAuthorsLoading] = useState(true);
  const [authorsError, setAuthorsError] = useState("");
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(true);

  const { favorites, toggleFavorite } =
    useContext(FavoriteContext);

  const fetchUserPreferences = useCallback(async () => {
    const user = getUser();
    const token = localStorage.getItem("token");

    if (!user || !token) {
      setError("Please log in to see recommendations.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${API}/api/user/${user.id}/preferences`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const preferences = response.data?.preferences;

      setUserPreferences(
        Array.isArray(preferences) ? preferences : []
      );
    } catch (err) {
      console.error("Preferences error:", err);
      setError("Failed to load user preferences.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBooksByFavoriteAuthors =
    useCallback(async () => {
      const user = getUser();
      const token = localStorage.getItem("token");

      if (!user || !token) {
        setAuthorsError("Please log in.");
        setAuthorsLoading(false);
        return;
      }

      setAuthorsLoading(true);
      setAuthorsError("");

      try {
        const response = await axios.get(
          `${API}/api/user/${user.id}/favoriteAuthors`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            timeout: 90000,
          }
        );

        const books = Array.isArray(response.data)
          ? response.data
          : [];

        const validBooks = books.filter(
          (book) => book?.id && book?.volumeInfo
        );

        setBooksByFavoriteAuthors(validBooks);

        console.log(
          "Books by favorite authors:",
          validBooks.length
        );
      } catch (err) {
        console.error("Favorite authors error:", err);

        setAuthorsError(
          "Could not load books by your favorite authors."
        );

        setBooksByFavoriteAuthors([]);
      } finally {
        setAuthorsLoading(false);
      }
    }, []);

  useEffect(() => {
    fetchUserPreferences();
    fetchBooksByFavoriteAuthors();
  }, [
    fetchUserPreferences,
    fetchBooksByFavoriteAuthors,
  ]);

  useEffect(() => {
    if (userPreferences.length === 0) return;

    let cancelled = false;

    const fetchBooksForPreferences = async () => {
      setLoading(true);

      try {
        const results = await Promise.allSettled(
          userPreferences.map(async (preference) => {
            const response = await axios.get(
              `${API}/api/recommendedBooks`,
              {
                params: {
                  preference,
                  startIndex:
                    (page - 1) * 16 +
                    Math.floor(Math.random() * 5),
                },
              }
            );

            return {
              preference,
              books: Array.isArray(response.data)
                ? response.data
                : [],
            };
          })
        );

        if (cancelled) return;

        let foundBooks = false;

        setBooksByPreference((previous) => {
          const updated = { ...previous };

          results.forEach((result) => {
            if (result.status !== "fulfilled") {
              console.error(
                "Recommendation request failed:",
                result.reason
              );
              return;
            }

            const { preference, books } = result.value;

            if (books.length > 0) {
              foundBooks = true;
            }

            const existing =
              page === 1
                ? []
                : updated[preference] || [];

            const combined = [...existing, ...books];

            updated[preference] = Array.from(
              new Map(
                combined
                  .filter((book) => book?.id)
                  .map((book) => [book.id, book])
              ).values()
            );
          });

          return updated;
        });

        setHasMore(foundBooks);
      } catch (err) {
        if (!cancelled) {
          console.error("Recommendations error:", err);
          setError("Failed to load recommendations.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchBooksForPreferences();

    return () => {
      cancelled = true;
    };
  }, [userPreferences, page]);

  const handleSaveAuthor = async (author) => {
    const user = getUser();
    const token = localStorage.getItem("token");

    if (!user || !token || !author) return;

    try {
      await axios.put(
        `${API}/api/user/${user.id}/favoriteAuthors`,
        { author },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchBooksByFavoriteAuthors();
    } catch (err) {
      console.error("Save author error:", err);
    }
  };

  const handleFavoriteSubmit = async (book) => {
    const user = getUser();
    const token = localStorage.getItem("token");

    if (!user || !token) {
      setError("Please log in first.");
      return;
    }

    const isFavorite = Array.isArray(favorites)
      ? favorites.some(
          (favorite) =>
            (favorite.id || favorite.bookId) === book.id
        )
      : false;

    try {
      if (isFavorite) {
        await axios.delete(
          `${API}/api/user/${user.id}/favoriteBook/${book.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        await axios.post(
          `${API}/api/user/${user.id}/favoriteBook`,
          {
            bookId: book.id,
            bookDetails: {
              id: book.id,
              volumeInfo: book.volumeInfo,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      toggleFavorite({
        id: book.id,
        volumeInfo: book.volumeInfo,
      });

      if (!isFavorite) {
        const author = book.volumeInfo?.authors?.[0];

        if (author) {
          await handleSaveAuthor(author);
        }
      }
    } catch (err) {
      console.error("Favorite book error:", err);
      alert("Failed to update favorite book.");
    }
  };

  const renderBook = (book) => {
    if (!book?.id || !book?.volumeInfo) return null;

    const info = book.volumeInfo;
    const title = info.title || "Untitled Book";
    const authors = Array.isArray(info.authors)
      ? info.authors.join(", ")
      : "Unknown Author";

    const thumbnail =
      info.imageLinks?.thumbnail ||
      info.imageLinks?.smallThumbnail;

    const isFavorite = Array.isArray(favorites)
      ? favorites.some(
          (favorite) =>
            (favorite.id || favorite.bookId) === book.id
        )
      : false;

    return (
      <div key={book.id} className="book-item">
        <p className="authorname">{authors}</p>

        <button
          type="button"
          className="heart-icon"
          onClick={() => handleFavoriteSubmit(book)}
          style={{
            color: isFavorite ? "red" : "white",
          }}
          aria-label={
            isFavorite
              ? "Remove from favorites"
              : "Add to favorites"
          }
        >
          ♥
        </button>

        <Link to={`/book/${book.id}`}>
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              className="book-thumbnail"
            />
          ) : (
            <div className="placeholder-cover">
              <p className="book-title">{title}</p>
              <p className="book-author">{authors}</p>
            </div>
          )}
        </Link>

        <Link
          to={`/book/${book.id}`}
          className="book-title"
        >
          {title}
        </Link>

        <div className="book-info">
          {info.description
            ? info.description.slice(0, 100) + "..."
            : "No description available."}
        </div>
      </div>
    );
  };

  return (
    <div className="book-page">
      <Navbar />

      {error && <p role="alert">{error}</p>}

      <div className="book-category">
        <h2>Books by Your Favorite Authors</h2>

        {authorsLoading ? (
          <p>Loading books by your favorite authors...</p>
        ) : authorsError ? (
          <div>
            <p>{authorsError}</p>
            <button
              type="button"
              onClick={fetchBooksByFavoriteAuthors}
            >
              Try Again
            </button>
          </div>
        ) : booksByFavoriteAuthors.length === 0 ? (
          <p>
            No books available from your favorite authors
            right now.
          </p>
        ) : (
          <div className="book-grid">
            {booksByFavoriteAuthors.map(renderBook)}
          </div>
        )}
      </div>

      {userPreferences.map((preference) => {
        const books = booksByPreference[preference] || [];

        return (
          <div
            key={preference}
            className="book-category"
          >
            <h2>Best {preference} Books</h2>

            <div className="book-grid">
              {books.map(renderBook)}
            </div>

            {!loading && books.length === 0 && (
              <p>
                No books available for this preference.
              </p>
            )}
          </div>
        );
      })}

      {loading && <p>Loading recommendations...</p>}

      {!loading &&
        hasMore &&
        userPreferences.length > 0 && (
          <button
            type="button"
            onClick={() =>
              setPage((previous) => previous + 1)
            }
          >
            Load More Books
          </button>
        )}

      <ScrollToTopButton />
    </div>
  );
};

export default BookRecommendationPage;
