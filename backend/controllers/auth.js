const jwt = require("jsonwebtoken");
const User = require("../models/User");
const BlackList = require("../models/BlackList");

const register = async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    const user = new User({
      username,
      email,
      password,
      profilename: username,
    });

    await user.save();
    res.json({ success: true, message: "Registration successful" });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const passwordMatch = await user.comparePassword(password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1 hour",
    });
    res.json({ success: true, token });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    const checkIfBlacklisted = await BlackList.findOne({ token }); // Check if that token is blacklisted
    if (checkIfBlacklisted) return res.sendStatus(204);
    const newBlacklist = new BlackList({
      token,
    });
    await newBlacklist.save();
    res.setHeader("Clear-Site-Data", '"cookies"');
    res
      .status(200)
      .json({ success: true, logout: true, message: "You are logged out!" });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: true,
      status: "error",
      message: "Internal Server Error",
    });
  }
  res.end();
};

module.exports = { register, login, logout };
