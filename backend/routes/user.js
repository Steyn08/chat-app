const express = require("express");
const { getUser, updateProfile } = require("../controllers/profile");

const router = express.Router();

router.get("/profile", getUser, (req, res) => {
  res.json({ message: `Welcome ${req.user.username}` });
});

router.post("/profile/update", updateProfile, (req, res) => {});

module.exports = router;
