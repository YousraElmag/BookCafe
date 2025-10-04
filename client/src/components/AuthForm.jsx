import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { FaCheckCircle } from "react-icons/fa";
import "../Styles/AuthForm.css";
import backgroundImage from "../../public/images/5.jpg";
import left from "../../public/images/13.gif";
import right from "../../public/images/11.gif";
import logo from "../../public/images/logo.png";
const AuthForm = () => {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isMatched, setIsMatched] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `http://localhost:5000/api/user/login`,
        { email, password },
      );
      if (response.data) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.id));
        localStorage.setItem("username", JSON.stringify(response.data.name));
        toast.success(`Welcome back, ${response.data.name}!`);
        login(response.data);
        navigate("/recommendations");
      }
    } catch (error) {
      toast.error("Error: " + error.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    try {
      const { data } = await axios.post(
        `http://localhost:5000/api/user/register`,
        { name, email, password, confirmPassword },
      );
      if (data) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.id));
        localStorage.setItem("username", JSON.stringify(data.name));
        toast.success(data.message);
        login(data);
        navigate("/categories");
      }
    } catch (error) {
      toast.error("Error: " + error.message);
    }
  };

  useEffect(() => {
    setIsMatched(password === confirmPassword && password.length > 0);
  }, [password, confirmPassword]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const userId = urlParams.get("userId");
    const isNewUser = urlParams.get("isNewUser") === "true";

    if (token && userId) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", userId);
      login({ token, id: userId });

      if (isNewUser) {
        navigate("/categories");
      } else {
        navigate("/recommendations");
      }
    }
  }, [login, navigate]);

  return (
    <div className="container-auth" id="Form">
      <img className="left-auth" src={left} alt="" />
      <img className="right-auth" src={right} alt="" />
      <img className="ground-auth" src={backgroundImage} alt="" />
      <div className="all-auth">
        <h2>{isLogin ? "Login" : "Register"}</h2>
        <form onSubmit={isLogin ? handleLogin : handleRegister}>
          {!isLogin && (
            <div className="form-group-auth">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}
          <div className="form-group-auth">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group-auth">
            <label htmlFor="password">Password:</label>
            <div className="input-with-icon-auth">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {isMatched && (
                <FaCheckCircle className="check-icon-auth show-auth" />
              )}
            </div>
          </div>
          {!isLogin && (
            <div className="form-group-auth">
              <label htmlFor="confirmPassword">Confirm Password:</label>
              <div className="input-with-icon-auth">
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required={!isLogin}
                />
                {isMatched && (
                  <FaCheckCircle className="check-icon-auth show-auth" />
                )}
              </div>
            </div>
          )}
          <button className="log-auth" type="submit">
            {isLogin ? "Login" : "Register"}
          </button>
        </form>
        <button
          className="regist-auth"
          onClick={() => setIsLogin((prev) => !prev)}
        >
          {isLogin ? "Register" : "Login"}
        </button>
        <div>
      
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
