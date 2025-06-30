const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
});

const gembaSchema = new mongoose.Schema(
  {
    area: { type: String, required: true },
    questions: [questionSchema],
    username: { type: String, required: true },
    status: { type: String, default: "failed" },
    imageIDs: [{ type: mongoose.Types.ObjectId }],
    comments: [{ type: String }],
  },
  { timestamps: true }
);

const gembaModel = mongoose.model("gemba", gembaSchema);

module.exports = gembaModel;
