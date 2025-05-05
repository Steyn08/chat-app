const mongoose = require("mongoose");
const bcrypt = require("bcrypt");


const generateUserCode = () => `USR${Date.now()}${Math.floor(Math.random() * 1000)}`;

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  profilename: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userCode: { type: String, unique: true, sparse: true, default: generateUserCode }, 
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  profileImage: { type: String }, 
});


UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10); 
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});


UserSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", UserSchema);
