const mongoose = require("mongoose");

const lotInspectionFormSchema = new mongoose.Schema(
  {
    station: { type: String, required: true },
    product: { type: String, required: true },
    username: { type: String, required: true },
    salesOrderNumber: { type: String, required: true, default: "" },
    itemCode1: { type: String, required: true },
    lotCode1: { type: String, required: true },
    itemCode2: { type: String, default: "" },
    lotCode2: { type: String, default: "" },
    itemCode3: { type: String, default: "" },
    lotCode3: { type: String, default: "" },
    itemCode4: { type: String, default: "" },
    lotCode4: { type: String, default: "" },
    imageIDs: [{ type: mongoose.Types.ObjectId }],
    anyDeviations: { type: String, required: true },
    deviationID: { type: String, default: "" },
    status: { type: String, default: "failed" },
    started: { type: Number, default: 0 },
    startDateTime: { type: Date },
  },
  { timestamps: true },
);

const lotInspectionFormModel = mongoose.model(
  "lotInspectionForms",
  lotInspectionFormSchema,
);

module.exports = lotInspectionFormModel;
