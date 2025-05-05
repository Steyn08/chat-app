const express = require("express");
const { getUser, updateProfile } = require("../controllers/profile");

const path = require("path");
const multer = require("multer");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/profile_images/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.get("/profile", getUser, (req, res) => {
  res.json({ message: `Welcome ${req.user.username}` });
});

router.post("/profile/update",upload.single("profile_image"), updateProfile, (req, res) => {});

module.exports = router;
