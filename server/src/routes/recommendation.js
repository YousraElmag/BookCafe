import { getBooksByPreference } from "../controllers/recomController.js";
import express from "express"; // Use import syntax for express
const recommendationRouter = express.Router();

// Define the route to get books by user preferences
recommendationRouter.get("/", getBooksByPreference);
export default recommendationRouter;
