import React, { useContext, useState } from "react";
import { FaHeart } from "react-icons/fa";
import { FavoriteContext } from "../context/FavoriteContext";
import PropTypes from "prop-types";
const FavoriteButton = ({ bookId }) => {
  const { favorites, toggleFavorite } = useContext(FavoriteContext);
  const [isFavorite, setIsFavorite] = useState(favorites.includes(bookId));

  const handleFavoriteClick = () => {
    toggleFavorite(bookId);
    setIsFavorite(!isFavorite);
  };

  return (
    <button
      onClick={handleFavoriteClick}
      style={{ border: "none", background: "none", cursor: "pointer" }}
    >
      <FaHeart
        style={{ color: isFavorite ? "red" : "white", fontSize: "24px" }}
      />
    </button>
  );
};

FavoriteButton.propTypes = {
  bookId: PropTypes.string.isRequired,
};

export default FavoriteButton;
