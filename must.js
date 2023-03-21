const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("./models/user");

exports.verifyRole =
  (...allowedRoles) =>
  async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({
          message: "Authorization header not found",
        });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      const userRole = decoded.role ?? "user";
      const requiredRole = [...allowedRoles];

      if (!requiredRole.includes(userRole)) {
        return res.status(403).json({
          message: "Insufficient privileges",
        });
      }

      req.user = decoded;

      next();
    } catch (error) {
      return res.status(403).json({
        message: "Invalid token",
      });
    }
  };