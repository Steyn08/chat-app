const jwt = require("jsonwebtoken");
const BlackList = require("../models/BlackList");
const { logout } = require("../controllers/auth");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied! No token provided." });
    }

    const checkIfBlacklisted = await BlackList.findOne({ token: token });

    if (checkIfBlacklisted)
      return res.status(401).json({
        success: false,
        message: "This session has expired. Please login",
        logout: true,
      });

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: decodedToken.userId };
    next();
  } catch (error) {
    res
      .status(401)
      .json({ success: false, message: "Invalid token", logout: true });
  }
};

module.exports = authMiddleware;
