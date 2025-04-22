const express = require("express");
const Message = require("../models/Message"); // Ensure this model exists
const authMiddleware = require("../middlewares/auth"); // Ensure authentication if needed
const Group = require("../models/Group");

const router = express.Router();

// ✅ Send a message
router.post("/send", authMiddleware, async (req, res) => {
  try {
    const { sender, text, receiver, groupId, attachments } = req.body;

    if (!sender || (!receiver && !groupId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid message data" });
    }

    const newMessage = new Message({
      sender,
      text,
      receiver: receiver || null,
      groupId: groupId || null,
      attachments: attachments || [],
    });

    await newMessage.save();

    const io = req.app.get("io");

    if (receiver) {
      io.emit(`private-message-${receiver}-${sender}`, newMessage);
    } else if (groupId) {
      io.emit(`group-message-${groupId}`, newMessage);
    }

    res.status(201).json({
      success: true,
      message: "Message sent successfully!",
      data: newMessage,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/list", authMiddleware, async (req, res) => {
  try {
    const group_id = req.query.group_id;
    const user_id = req.query.user_id;
    const currentUser = req.user.userId;

    if (!group_id && !user_id) {
      return res
        .status(400)
        .json({ success: false, message: "Unable to process this required" });
    }

    if (group_id) {
      const group = await Group.findById(group_id).populate(
        "members",
        "username"
      );
      if (!group)
        return res
          .status(404)
          .json({ success: false, message: "Group not found" });

      const messages = await Message.find({ groupId: group_id })
        .populate("sender", "username")
        .sort({ timestamp: 1 });

      return res.json({ success: true, data: messages });
    }
    if (user_id) {
      const messages = await Message.find({
        $or: [
          { sender: currentUser, receiver: user_id },
          { sender: user_id, receiver: currentUser },
        ],
      })
        // .sort({ timestamp: -1 })
        .select("text timestamp sender receiver")
        .lean();

      return res.json({ success: true, data: messages });
    }
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
