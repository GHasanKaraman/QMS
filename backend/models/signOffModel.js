const mongoose = require("mongoose");

const signOffSchema = new mongoose.Schema(
  {
    formID: { type: mongoose.Types.ObjectId },
    signedOff: { type: String, required: true },
    signOffDate: { type: Date },
  },
  { timestamps: true },
);

const signOffModel = mongoose.model("signOff", signOffSchema);

module.exports = signOffModel;
