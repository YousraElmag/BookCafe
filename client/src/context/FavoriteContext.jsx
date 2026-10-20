
import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import PropTypes from "prop-types";
import axios from "axios";

export const FavoriteContext = createContext();

const API_URL = "https://bookcafe2.onrender.com/api/user";

export const FavoriteProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  const refreshFavorites = useCallback(async () => {
    let user;

    try {
      user = JSON.parse(localStorage.getItem("user"));
    } catch {
      user = null;
    }

    if (!user?.id) {
      setFavorites([]);
      return;
    }

    try {
      const response = await axios.get(
        `${API_URL}/${user.id}/favoriteBooks`
      );

      if (!Array.isArray(response.data)) {
        throw new Error("Invalid favorites response");
      }

      setFavorites(response.data);
    } catch (error) {
      console.error("Failed to load favorites:", error);
    }
  }, []);

  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  const toggleFavorite = (book) => {
    setFavorites((previous) => {
      const exists = previous.some(
        (favorite) => favorite.id === book.id
      );

      return exists
        ? previous.filter((favorite) => favorite.id !== book.id)
        : [...previous, book];
    });
  };

  const clearFavoritesOnLogout = () => {
    setFavorites([]);
    localStorage.removeItem("favorites");
  };

  return (
    <FavoriteContext.Provider
      value={{
        favorites,
        toggleFavorite,
        refreshFavorites,
        clearFavoritesOnLogout,
      }}
    >
      {children}
    </FavoriteContext.Provider>
  );
};

FavoriteProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
