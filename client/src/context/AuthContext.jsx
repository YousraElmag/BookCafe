import React, { createContext, useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    const isLoggedInStatus = localStorage.getItem("isLoggedIn") === "true";

    if (storedUser && token && isLoggedInStatus) {
      setUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const login = (userData) => {
    localStorage.setItem("token", userData.token);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("isLoggedIn", "true");
    setUser(userData);
    setIsLoggedIn(true);
    navigate("/recommendations");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    setUser(null);
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, login, logout, isLoggedIn, setIsLoggedIn }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);
