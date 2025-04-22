const express = require("express");
const {
  createGroup,
  getGroup,
  updateGroup,
  deleteGroup,
  addMember,
  removeMember,
  getGroupList,
} = require("../controllers/groups.js");

const router = express.Router();

router.post("/create", createGroup);
router.get("/list", getGroupList);
router.get("/:groupId", getGroup);
router.put("/:groupId", updateGroup);
router.delete("/:groupId", deleteGroup);
router.post("/:groupId/add-members", addMember);
router.delete("/:groupId/remove-members/:userId", removeMember);

module.exports = router;
