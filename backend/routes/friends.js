const express = require("express");
const {
  addFriend,
  searchFriend,
  removeFriend,
  listFriend
} = require("../controllers/friends");

const router = express.Router();

router.post("/add-friend", addFriend, (req, res) => {
  //   res.json({ message: `Welcome ${req.user.username}` });
});

router.get("/search", searchFriend, (req, res) => {});
router.get("/list", listFriend, (req, res) => {});
router.post("/remove-friend", removeFriend, (req, res) => {});

module.exports = router;
