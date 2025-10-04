// src/routes/categories.js
import express from "express";
import { saveUserCategories } from "../controllers/categoryController.js"; // Import the controller


const categoryRouter = express.Router();

// POST /api/categories
categoryRouter.post("/",saveUserCategories); // Handle categories selection

export default categoryRouter;
