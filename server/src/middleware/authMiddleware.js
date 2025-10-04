import jwt from "jsonwebtoken";

export const ensureAuthenticated = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1]; // Extract token from Bearer

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403); // Invalid token
      }

      req.user = user; // Attach user info to request
      next();
    });
  } else {
    res.sendStatus(401); // No token
  }
};
