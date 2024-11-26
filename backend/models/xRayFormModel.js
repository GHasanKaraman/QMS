const mongoose = require("mongoose");

const xRayFormSchema = new mongoose.Schema(
  {
    station: { type: String, required: true },
    product: { type: String, required: true },
    username: { type: String, required: true },
    lotCode: { type: String, required: true },
    personBeingObserved: { type: String, required: true },
    status: { type: String, default: "failed" },
    started: { type: Number, default: 0 },
    startDateTime: { type: Date },
  },
  { timestamps: true },
);

const xRayFormModel = mongoose.model("xRayForms", xRayFormSchema);

module.exports = xRayFormModel;
