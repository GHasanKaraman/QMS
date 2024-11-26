const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    formID: { type: mongoose.Types.ObjectId, required: true },
    form: { type: String, required: true },
    comment: { type: String, default: "" },
    imageID: { type: mongoose.Types.ObjectId, default: null },
  },
  { timestamps: true }
);

const commentModel = mongoose.model("comments", commentSchema);

module.exports = commentModel;
