const mongoose = require("mongoose");

const ratioFormSchema = new mongoose.Schema(
  {
    station: { type: String, required: true },
    shift: { type: String, required: true },
    product: { type: String, required: true },
    username: { type: String, required: true },
    recipe: { type: mongoose.Schema.Types.Mixed, required: true },
    status: { type: String, default: "failed" },
  },
  { timestamps: true },
);

const ratioFormModel = mongoose.model("ratioForms", ratioFormSchema);

module.exports = ratioFormModel;
