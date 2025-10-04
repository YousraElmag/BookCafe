import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  Image: { type: [String], default: [] },
  preferences: { type: [String], default: [] },
  firstLogin: { type: Boolean, default: true },
  favoriteAuthors: { type: [String], default: [] },
  favoriteBook: { type: [String], default: [] },
  profileImage: { type: String, default: " " },
});

// Method to generate JWT for a user instance
userSchema.methods.generateJWT = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      name: this.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }, // Adjust expiration as needed
  );
};

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
