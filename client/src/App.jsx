import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";
import CategoryAndPreferences from "./components/CategorySelection";
import BookRecommendationPage from "./pages/BookRecommandationPage";
import Footer from "./components/Footer";
import NotFoundPage from "./pages/NotFoundPage";
import Home from "./pages/Home/Home";
import BookDetailComponent from "./components/BookDetailCompo";
import FavoritesPage from "./pages/FavoritesPage";
import AuthForm from "./components/AuthForm";
import { FavoriteProvider } from "./context/FavoriteContext";
import { AuthProvider } from "./context/AuthContext";
import { CategoryProvider } from "./context/CategoryContext";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  const location = useLocation();

  return (
    <AuthProvider>
      <FavoriteProvider>
        <CategoryProvider>
          {" "}
          <div className="app-container">
            {location.pathname === "/" && <Navbar />}
            <Toaster
              position="bottom-right"
              toastOptions={{ duration: 2000 }}
            />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<AuthForm />} />
              <Route
                path="/categories"
                element={
                  <ProtectedRoute>
                    <CategoryAndPreferences />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recommendations"
                element={
                  <ProtectedRoute>
                    <BookRecommendationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/favorites"
                element={
                  <ProtectedRoute>
                    <FavoritesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route path="/book/:id" element={<BookDetailComponent />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            <Footer />
          </div>
        </CategoryProvider>
      </FavoriteProvider>
    </AuthProvider>
  );
};

export default App;
