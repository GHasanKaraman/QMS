const mongoose = require("mongoose");

const metalDetectorFormSchema = new mongoose.Schema(
  {
    station: { type: String, required: true },
    product: { type: String, required: true },
    username: { type: String, required: true },
    lotCode: { type: String, required: true },
    personBeingObserved: { type: String, required: true },
    ballOrCard: { type: String, required: true },
    status: { type: String, default: "failed" },
    started: { type: Number, default: 0 },
    startDateTime: { type: Date },
  },
  { timestamps: true },
);

const metalDetectorFormModel = mongoose.model(
  "metalDetectorForms",
  metalDetectorFormSchema,
);

module.exports = metalDetectorFormModel;
