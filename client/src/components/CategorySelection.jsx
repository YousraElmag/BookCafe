/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useCategory } from "../context/CategoryContext"; // Import the context
import Navbar from "./Navbar";
import "../Styles/CategorySelection.css";
import background from "../../public/images/15.jpg";
import background2 from "../../public/images/99.gif";

const CategoryAndPreferences = () => {
  const categories = [
    "Fiction",
    "Non-Fiction",
    "Mystery",
    "Fantasy",
    "Romance",
    "Sci-Fi",
    "Thriller",
    "Food & Cooking",
    "Biography",
    "Self-Help",
    "Historical Fiction",
    "Young Adult",
    "Horror",
    "Graphic Novels",
    "Poetry",
    "Business",
    "Travel",
    "Health & Fitness",
    "Children's Books",
    "True Crime",
  ];

  const { selectedCategories, updateCategories } = useCategory();
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const handleCategoryClick = (category) => {
    const newSelectedCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((cat) => cat !== category)
      : [...selectedCategories, category];

    updateCategories(newSelectedCategories);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !token) {
      setError("User not authenticated. Please log in.");
      return;
    }

    try {
      const preferencesResponse = await axios.put(
        `https://bookcafe2.onrender.com/api/user/${user.id}`,
        {
          preferences: selectedCategories,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setMessage("Preferences saved successfully!");
      setError(null);
      navigate("/recommendations");
    } catch (err) {
      setError("An error occurred. Please try again.");
      setMessage("");
    }
  };

  return (
    <>
      <Navbar />
      <div className="category-container">
        <img className="background" src={background} alt="" />
        <img className="background2" src={background2} alt="" />
        <h1 className="category-title">Discover Your Interests</h1>
        {error && <div className="error-message">{error}</div>}
        <div className="category-list">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-item ${selectedCategories.includes(category) ? "selected" : ""}`}
              onClick={() => handleCategoryClick(category)}
            >
              {category}
            </button>
          ))}
        </div>
        <button
          onClick={handleSubmit}
          disabled={selectedCategories.length === 0}
        >
          Confirm
        </button>
        {message && <p style={{ color: "green" }}>{message}</p>}
      </div>
    </>
  );
};

export default CategoryAndPreferences;
