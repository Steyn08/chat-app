const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String },
  attachments: [{ type: String }], 
  timestamp: { type: Date, default: Date.now },

  // Chat Type: Either Individual or Group
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', default: null }, 
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null } 
});

module.exports = mongoose.model('Message', MessageSchema);
