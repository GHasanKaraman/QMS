const mongoose = require("mongoose");

const mixingQualityFormSchema = new mongoose.Schema(
  {
    station: { type: String, required: true },
    shift: { type: String, required: true },
    product: { type: String, required: true },
    username: { type: String, required: true },
    lotCode: { type: String, required: true },
    correctLabel: { type: String, required: true },
    probioticMixLot: { type: String, required: true },
    probioticMixLotCode: { type: String, default: "" },
    cleaning: { type: String, required: true },
    allergensSeparate: { type: String, required: true },
    areAllergensCorrect: { type: String, required: true },
    sensory: { type: String, required: true },
    cleanFloor: { type: String, required: true },
    garbageOrganized: { type: String, required: true },
    anyDeviations: { type: String, required: true },
    deviationID: { type: String, default: "" },
    imageIDs: [{ type: mongoose.Types.ObjectId }],
    status: { type: String, default: "failed" },
    started: { type: Number, default: 0 },
    startDateTime: { type: Date },
  },
  { timestamps: true },
);

const mixingQualityFormModel = mongoose.model(
  "mixingQualityForms",
  mixingQualityFormSchema,
);

module.exports = mixingQualityFormModel;
