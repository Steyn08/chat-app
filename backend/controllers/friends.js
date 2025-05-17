const Message = require("../models/Message");
const User = require("../models/User");

const addFriend = async (req, res) => {
  try {
    const userId = req.body.user_id;

    if (req.user.userId === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot add yourself as a friend.",
      });
    }
    const user = await User.findById(userId).select("-password");
    const currentUser = await User.findById(req.user.userId).select(
      "-password"
    );
    console.log(user, currentUser);

    if (!user || !currentUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (currentUser.friends.includes(userId)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "User is already in your friends list.",
        });
    }

    currentUser.friends.push(user._id);
    user.friends.push(currentUser._id);

    await Promise.all([currentUser.save(), user.save()]);

    res.status(200).json({
      success: true,
      message: "Friend added successfully",
      friends: currentUser.friends,
    });
  } catch (error) {
    console.error("Error adding friend:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const searchFriend = async (req, res) => {
  try {
    const currentUser = req.user.userId;

    const { query } = req.query;
    if (!query) {
      return res
        .status(400)
        .json({ success: false, message: "Search query is required" });
    }

    const users = await User.find({
      $and: [
        {
          $or: [
            { name: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } },
          ],
        },
        { _id: { $ne: req.user.userId } },
      ],
    }).populate("friends", "profilename email id");
    res.json({ success: true, data: users });
  } catch (error) {
    console.error("Error adding friend:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const removeFriend = async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user.userId;

    if (!userId || !friendId) {
      return res
        .status(400)
        .json({ message: "User ID and Friend ID are required" });
    }

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ message: "User not found" });
    }

    user.friends = user.friends.filter((id) => id.toString() !== friendId);
    friend.friends = friend.friends.filter((id) => id.toString() !== userId);

    await user.save();
    await friend.save();

    res.json({ message: "Friend removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const listFriend = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.userId).populate(
      "friends",
      "profilename email profileImage"
    );

    if (!currentUser) {
      return res
        .status(404)
        .json({ success: false, message: "Friends not found" });
    }

    const friendsData = await Promise.all(
      currentUser.friends.map(async (friend) => {
        const lastMessage = await Message.findOne({
          $or: [
            { sender: currentUser._id, receiver: friend._id },
            { sender: friend._id, receiver: currentUser._id },
          ],
        })
          .sort({ timestamp: -1 })
          .select("text timestamp attachments")
          .lean();

        return {
          _id: friend._id,
          name: friend.profilename,
          profileImage: friend.profileImage || "",
          email: friend.email,
          lastMessage: lastMessage?.text || "",
          lastAttachment: lastMessage?.attachments || "",
          lastMessageTime: lastMessage?.timestamp || null,
        };
      })
    );

    res.json({ success: true, data: friendsData });
  } catch (error) {
    console.error("Error adding friend:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { addFriend, searchFriend, removeFriend, listFriend };
