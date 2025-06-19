const User = require("../models/User");
const Group = require("../models/Group");
const Message = require("../models/Message");
const fs = require("fs");
const path = require("path");

const createGroup = async (req, res) => {
  try {
    const { name, members, group_description } = req.body;
    const admin = req.user.userId;

    const group = new Group({
      name,
      admin,
      members: [...members, admin],
      groupDescription: group_description,
    });

    await group.save();

    res.status(201).json({ message: "Group created successfully" });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Server error" });
  }
};

const getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId).populate(
      "members",
      "username"
    );

    const messages = await Message.find({ groupId: req.params.groupId })
      .populate("sender", "username")
      .sort({ timestamp: 1 });

    if (!group) return res.status(404).json({ message: "Group not found" });

    res.json({ group, messages });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getGroupList = async (req, res) => {
  try {
    const currentUser = req.user.userId;
    const groups = await Group.find({ members: currentUser }).populate(
      "members",
      "username profileImage profilename"
    );

    if (!groups.length)
      return res.json({ success: true, data: [], message: "No groups found" });

    const groupData = await Promise.all(
      groups.map(async (group) => {
        const lastMessage = await Message.findOne({ groupId: group._id })
          .sort({ timestamp: -1 })
          .select("text timestamp attachments")
          .lean();

        return {
          _id: group._id,
          name: group.name,
          groupIcon: group.groupIcon,
          members: group.members,
          groupDescription: group.groupDescription,
          admin: group.admin,
          lastMessage: lastMessage?.text || "",
          lastAttachment: lastMessage?.attachments || "",
          lastMessageTime: lastMessage?.timestamp || null,
        };
      })
    );

    res.json({ success: true, data: groupData });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateGroup = async (req, res) => {
  try {
    const { name, groupDescription } = req.body;
    const group = await Group.findById(req.params.groupId);

    if (!group) return res.status(404).json({ message: "Group not found" });
    if (group.admin.toString() !== req.user.userId)
      return res.status(403).json({ message: "Not authorized" });

    group.name = name || group.name;
    group.groupDescription = groupDescription || group.groupDescription;
    await group.save();

    res.json({ message: "Group updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.admin.toString() !== req.user.userId)
      return res.status(403).json({ message: "Not authorized" });

    await group.deleteOne();
    res.json({ message: "Group deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const addMember = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group)
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });

    if (!group.members.includes(req.body.user_id)) {
      group.members.push(req.body.user_id);
      await group.save();
    } else {
      return res.status(403).json({
        success: false,
        message: "This user is already added in this group",
      });
    }

    let newMember = await User.findOne({ _id: req.body.user_id });

    res.json({
      success: true,
      message: "member added successfully",
      newMember,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

const removeMember = async (req, res) => {
  try {
    console.log(req.params.userId);

    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    group.members = group.members.filter(
      (member) => member?.toString() !== req.params.userId
    );
    await group.save();

    res.json({ success: true, group, message: "User removed successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateProfileImage = async (req, res) => {
  try {
    console.log(req.params.userId);

    const group = await Group.findById(req.params.groupId);
    if (!group)
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });

    if (group.profileImage) {
      const oldImagePath = path.join(__dirname, "../", group.groupIcon);
      console.log("old-image", oldImagePath);

      fs.unlink(oldImagePath, (err) => {
        if (err) {
          console.warn("Old image not deleted (may not exist):", err.message);
        }
      });
    }

    if (req.file) {
      group.groupIcon = req.file.path;
    } else {
      return res
        .status(400)
        .json({ success: false, message: "No image uploaded" });
    }
    await group.save();

    res.json({ group, success: true, message: "User removed successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const removeProfileImage = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group || !group.groupIcon) {
      return res.status(404).json({
        success: false,
        message: "No profile image found",
      });
    }

    const imagePath = path.join(__dirname, "../", group.groupIcon);

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    group.groupIcon = "";
    await group.save();

    res.status(200).json({
      success: true,
      message: "Profile image removed",
      data: { group },
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
  createGroup,
  getGroup,
  updateGroup,
  deleteGroup,
  addMember,
  removeMember,
  getGroupList,
  updateProfileImage,
  removeProfileImage,
};
