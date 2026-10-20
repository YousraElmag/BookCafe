/* eslint-disable no-console */
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import "../Styles/bookDetailCompo.css";
import { FavoriteContext } from "../context/FavoriteContext";
import Navbar from "../components/Navbar";
import axios from "axios";

const BookDetailComponent = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [error, setError] = useState(false);
  const { favorites, toggleFavorite } = useContext(FavoriteContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await axios.get(
          `https://bookcafe2.onrender.com/api/book/detail/${id}`,
        );
        setBook(response.data);
      } catch (error) {
        setError(true);
        console.error("Fetch error:", error);
      }
    };

    fetchBook();
  }, [id]);
const handleFavoriteSubmit = async () => {
  let user;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  if (!user?.id) {
    alert("Please log in first.");
    return;
  }

  const isAlreadyFavorite = favorites.some(
    (favBook) => favBook.id === id
  );

  try {
    if (isAlreadyFavorite) {
      await axios.delete(
        `https://bookcafe2.onrender.com/api/user/${user.id}/favoriteBook/${id}`
      );
    } else {
      await axios.post(
        `https://bookcafe2.onrender.com/api/user/${user.id}/favoriteBook`,
        {
          bookId: id,
          bookDetails: {
            id,
            volumeInfo: {
              title: book.volumeInfo?.title || "",
              authors: book.volumeInfo?.authors || [],
              imageLinks: {
                thumbnail:
                  book.volumeInfo?.imageLinks?.thumbnail || "",
              },
            },
          },
        }
      );
    }

    // Update the heart only after the server request succeeds
    toggleFavorite({
      id,
      volumeInfo: book.volumeInfo,
    });
  } catch (err) {
    console.error("Failed to update favorite:", err);
    alert("Failed to update favorite book.");
  }
};

  if (error) return <div>Error loading the book details.</div>;
  if (!book) return <div>Loading...</div>;

  const isFavorite = favorites.some((favBook) => favBook.id === id);
  const pdfAvailable = book.accessInfo?.pdf?.isAvailable;
  const pdfLink = book.accessInfo?.pdf?.acsTokenLink;
  const buyLink = book.saleInfo?.buyLink;
  const readLink = book.accessInfo?.webReaderLink;
  console.log("PDF Link:", pdfLink);
  console.log("Buy Link:", buyLink);
  console.log("Read Link:", readLink);

  return (
    <div>
      <div className="navbar-container">
        <Navbar />
        <button
          className="backButton-custom"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <FaArrowLeft />
        </button>
      </div>
      <div className="bookDetailContainer-custom">
        <div className="bookImage-custom">
          <img
            src={book.volumeInfo?.imageLinks?.thumbnail || "/default-image.jpg"}
            alt={book.volumeInfo?.title || "No Title"}
          />
        </div>
        <div className="bookInfo-custom">
          <h3 className="bookH-custom">{book.volumeInfo?.title}</h3>
          <div className="bookMeta-custom">
            <span>Category: {book.volumeInfo?.categories?.[0] || "N/A"}</span>
            <span>
              Author: {book.volumeInfo?.authors?.join(", ") || "Unknown"}
            </span>
            <span>
              Published Year: {book.volumeInfo?.publishedDate || "N/A"}
            </span>
          </div>
          <p className="bookDescription-custom">
            {book.volumeInfo?.description ||
              "No detailed description available."}
          </p>
          <div className="bookButtons-custom buttonContainer-custom">
            {pdfAvailable && (
              <a
                href={pdfLink}
                target="_blank"
                rel="noopener noreferrer"
                className="pdfButton-custom"
              >
                View PDF
              </a>
            )}
            {buyLink && (
              <a
                href={buyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="buyButton-custom"
              >
                Buy Link
              </a>
            )}
            {readLink && (
              <a
                href={readLink}
                target="_blank"
                rel="noopener noreferrer"
                className="readButton-custom"
              >
                Read Now
              </a>
            )}
          </div>
          <button
            className="heart-icon-bdc"
          onClick={handleFavoriteSubmit}
            style={{ color: isFavorite ? "red" : "white" }}
            aria-label={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
          >
            ♥
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookDetailComponent;
