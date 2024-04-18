const mongoose = require("mongoose");

const pgQualityControlFormSchema = new mongoose.Schema(
  {
    metalDetector: { type: String, required: true },
    metalBallFeDetected: { type: String, default: "" },
    metalBallNonFeDetected: { type: String, default: "" },
    metalBallSsDetected: { type: String, default: "" },
    areIngredientsCorrect: { type: String, required: true },
    station: { type: String, required: true },
    product: { type: String, required: true },
    username: { type: String, required: true },
    lotCodePouch: { type: String, required: true },
    expirationDatePouch: { type: String, required: true },
    currentWeightPouch: { type: String, required: true },
    isNotchCorrect: { type: String, required: true },
    isSealCorrectPouch: { type: String, required: true },
    currentWeightBox: { type: String, required: true },
    isSealCorrectBox: { type: String, required: true },
    expirationDateCase: { type: String, required: true },
    lotCodeCase: { type: String, required: true },
    imageIDs: [{ type: mongoose.Types.ObjectId }],
    status: { type: String, default: "failed" },
    signedOff: { type: String, default: "" },
    signOffDate: { type: Date },
  },
  { timestamps: true }
);

const pgQualityControlFormModel = mongoose.model(
  "pgQualityControlForms",
  pgQualityControlFormSchema
);

module.exports = pgQualityControlFormModel;
