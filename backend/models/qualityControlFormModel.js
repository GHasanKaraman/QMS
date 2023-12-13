const mongoose = require("mongoose");
const essentials = require("../utils/essentials");

const qualityControlFormSchema = new mongoose.Schema(
  {
    station: { type: String, required: true },
    product: { type: String, required: true },
    username: { type: String, required: true },
    areIngredientsCorrect: { type: String, required: true },
    isTasteAcceptable: { type: String, required: true },
    lotCode: { type: String, required: true },
    expirationDate: { type: String, required: true },
    currentWeight: { type: String, required: true },
    unitOfMeasure: { type: String, required: true },
    isSealCorrect: { type: String, required: true },
    isNotchCorrect: { type: String, required: true },
    xrayRequired: { type: String, required: true },
    xrayFeDetected: { type: String, default: "" },
    xrayNonFeDetected: { type: String, default: "" },
    xraySsDetected: { type: String, default: "" },
    metalCardRequired: { type: String, required: true },
    metalCardFeDetected: { type: String, default: "" },
    metalCardNonFeDetected: { type: String, default: "" },
    metalCardSsDetected: { type: String, default: "" },
    metalBallRequired: { type: String, required: true },
    metalBallFeDetected: { type: String, default: "" },
    metalBallNonFeDetected: { type: String, default: "" },
    metalBallSsDetected: { type: String, default: "" },
    correctContainer: { type: String, required: true },
    areAllergensCorrect: { type: String, required: true },
    allergenStatement: { type: String, required: true },
    labelPackageCorrect: { type: String, required: true },
    unitsCase: { type: String, required: true },
    salesOrderNumber: { type: String, required: true },
    caseLabel: { type: String, required: true },
    anyDeviations: { type: String, required: true },
    imageIDs: [{ type: mongoose.Types.ObjectId }],
  },
  { timestamps: true }
);

const qualityControlFormModel = mongoose.model(
  "qualityControlForms",
  qualityControlFormSchema
);

module.exports = qualityControlFormModel;
