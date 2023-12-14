const mongoose = require("mongoose");
const essentials = require("../utils/essentials");

const labelInspectionFormSchema = new mongoose.Schema(
  {
    station: { type: String, required: true },
    product: { type: String, required: true },
    username: { type: String, required: true },
    lotCode: { type: String, required: true },
    isAllergenStatementCorrect: { type: String, required: true },
    personBeingObserved: { type: String, required: true },
    status: { type: String, default: "failed" },
  },
  { timestamps: true }
);

const labelInspectionFormModel = mongoose.model(
  "labelInspectionForms",
  labelInspectionFormSchema
);

module.exports = labelInspectionFormModel;
