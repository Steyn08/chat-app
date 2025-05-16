const { log } = require("console");
const User = require("../models/User");
const fs = require("fs");
const path = require("path");

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const { name, email } = req.body;

    if (name) user.profilename = name;
    if (email) user.email = email;

    if (req.file) {
      console.log(req.file.path);
      user.profileImage = req.file.path;
    }

    await user.save();
    res
      .status(200)
      .json({
        success: true,
        message: "Profile updated successfully",
        data: { user },
      });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateProfileImage = async (req, res) => {
  console.log("req", req.file);

  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.profileImage) {
      const oldImagePath = path.join(__dirname, "../", user.profileImage);
      console.log("old-image", oldImagePath);

      fs.unlink(oldImagePath, (err) => {
        if (err) {
          console.warn("Old image not deleted (may not exist):", err.message);
        }
      });
    }

    if (req.file) {
      user.profileImage = req.file.path;
    } else {
      return res
        .status(400)
        .json({ success: false, message: "No image uploaded" });
    }

    await user.save();
    res.status(200).json({
      success: true,
      message: "Profile image updated",
      data: { user },
      profileImage: user.profileImage,
    });
  } catch (error) {
    console.error("Error updating profile image:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const removeProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || !user.profileImage) {
      return res.status(404).json({
        success: false,
        message: "No profile image found",
      });
    }

    const imagePath = path.join(__dirname, "../", user.profileImage);

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    user.profileImage = "";
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile image removed",
      data: { user },
    });
  } catch (error) {
    console.error("Error removing profile image:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getUser,
  updateProfile,
  updateProfileImage,
  removeProfileImage,
};
