const express = require("express");
const {
  createGroup,
  getGroup,
  updateGroup,
  deleteGroup,
  addMember,
  removeMember,
  getGroupList,
  updateProfileImage,
  removeProfileImage,
} = require("../controllers/groups.js");
const path = require("path");
const multer = require("multer");
const router = express.Router();
const fs = require("fs");

const messagesDir = path.join(__dirname, "..", "public/group/profile_images");

if (!fs.existsSync(messagesDir)) {
  fs.mkdirSync(messagesDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/group/profile_images/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post("/create", createGroup);
router.get("/list", getGroupList);
router.get("/:groupId", getGroup);
router.put("/:groupId", upload.none(), updateGroup);
router.delete("/:groupId", deleteGroup);
router.post("/:groupId/add-members", addMember);
router.delete("/:groupId/remove-member/:userId", removeMember);
router.post(
  "/update-profile-image/:groupId",
  upload.single("profile_image"),
  updateProfileImage,
  (req, res) => {}
);

router.delete("/profile/image/:groupId", removeProfileImage, (req, res) => {});

module.exports = router;
