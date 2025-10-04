import { useEffect } from "react"; // Import useEffect
import PropTypes from "prop-types"; // Import PropTypes
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth(); // Use isLoggedIn directly
  const navigate = useNavigate(); // Use useNavigate to handle navigation

  useEffect(() => {
    if (!isLoggedIn) {
      toast.error("User not found. Please log in.");
      // If user is not authenticated, navigate to the homepage
      navigate("/", { replace: true });

      // Delay scroll to ensure navigation completes
      setTimeout(() => {
        const formElement = document.getElementById("Form");
        if (formElement) {
          window.scrollTo({
            top: formElement.offsetTop,
            behavior: "smooth",
          });
        }
      }, 100); // Delay for smoother experience
    }
  }, [isLoggedIn, navigate]);

  // If user is authenticated, return children; otherwise return null
  return isLoggedIn ? children : null; // Prevent rendering protected content for unauthenticated users
};
// Define prop types
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired, // children should be a React node
};

export default ProtectedRoute;
