import express from "express";
import mongoose from "mongoose";
import User from "./models/User.js"; // Removed validateUser import

import { logError } from "./util/logging.js";

const testRouter = express.Router();

testRouter.post("/seed", async (req, res) => {
  if (!process.env.MONGODB_URL.includes("cypressDatabase")) {
    const msg =
      "The database you are trying to seed is not the cypress database! Did you forget to change your .env variable?";
    logError(msg);

    res.status(400).json({
      success: false,
      msg,
    });
  } else {
    await emptyDatabase();

    const data = {
      users: [
        {
          name: "Rob",
          email: "rob@hackyourfuture.net",
        },
      ],
    };

    // Removed validation logic
    // Instead of validating each user, you might want to directly create the users.
    try {
      // Add users to the database
      await User.create(data.users);
    } catch (error) {
      const err = new Error(
        `Error adding users to the database: ${error.message}`,
      );
      logError(err);
      return res.status(400).json({
        success: false,
        msg: err.message,
      });
    }

    // Fetch to add to the return
    const finalUsers = await User.find();

    res.status(201).json({
      success: true,
      data: {
        users: finalUsers,
      },
    });
  }
});

const emptyDatabase = async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

export default testRouter;
