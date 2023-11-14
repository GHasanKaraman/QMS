const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  username: { type: String, required: true },
  password: {
    type: String,
    required: true,
    default: "202cb962ac59075b964b07152d234b70",
  },
  facility: { type: String, required: true, default: "vreeland" },
  phone: { type: String, required: true, default: "0000000000" },
  position: { type: String, required: true, default: "Technician" },
  zone: { type: String, required: true, default: "zone 1" },
  permissions: { type: String },
});

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;
