const mongoose = require("mongoose");
const essentials = require("../utils/essentials");

const tokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  loginUser: { type: String, required: true },
  userName: { type: String, required: true },
  access: { type: String, default: "" },
  createdAt: {
    type: Date,
    default: () => essentials.getEST(),
    required: true,
  },
});

const tokenModel = mongoose.model("tokens", tokenSchema);

module.exports = tokenModel;
