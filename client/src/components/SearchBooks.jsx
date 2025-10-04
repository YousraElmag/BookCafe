// SearchBooks.js
import React, { useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import "../Styles/SearchBooks.css";

const SearchBooks = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = async () => {
    if (!isLoggedIn) {
      toast.error("Please log in to search for books.");
      const formElement = document.getElementById("Form");
      if (formElement) {
        window.scrollTo({
          top: formElement.offsetTop,
          behavior: "smooth",
        });
      }
      return;
    }

    if (!searchTerm.trim()) return;
    try {
      const response = await axios.get(
        `https://bookcafe2.onrender.com/api/books/search?query=${encodeURIComponent(searchTerm)}`,
      );
      setSearchResults(response.data.data || []);
    } catch (error) {
      toast.error(
        "Error fetching data: " +
          (error.response?.data?.error || error.message),
      );
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const handleBookClick = (bookId) => {
    navigate(`/book/${bookId}`);
  };

  return (
    <div className="search-books-container">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search for books..."
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          className="search-input"
        />
        <FontAwesomeIcon
          icon={faSearch}
          className="search-icon"
          onClick={handleSearchSubmit}
        />
      </div>
      {searchResults.length > 0 && (
        <ul className="search-results-list">
          {searchResults.map((book) => (
            <li
              key={book.id}
              className="search-result-item"
              onClick={() => handleBookClick(book.id)}
            >
              <img
                src={
                  book.volumeInfo?.imageLinks?.thumbnail || "/default-image.jpg"
                }
                alt=""
              />
              <div className="book-title">{book.volumeInfo.title}</div>
              <div className="book-author">
                {book.volumeInfo.authors?.join(", ")}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBooks;
