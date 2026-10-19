const mongoose = require("mongoose");

const nitrogenTestFormSchema = new mongoose.Schema(
  {
    station: { type: String, required: true },
    shift: { type: String, required: true },
    product: { type: String, required: true },
    username: { type: String, required: true },
    lotCode: { type: String, required: true },
    // "No" for single-sided machines; right side fields are left empty
    hasRightSide: { type: String, default: "Yes" },
    nitrogenLeftBeginning: { type: String, required: true },
    nitrogenLeftMiddle: { type: String, required: true },
    nitrogenLeftEnd: { type: String, required: true },
    nitrogenRightBeginning: { type: String, default: "" },
    nitrogenRightMiddle: { type: String, default: "" },
    nitrogenRightEnd: { type: String, default: "" },
    // [0] = left side screen photo, [1] = right side screen photo (if any)
    imageIDs: [{ type: mongoose.Types.ObjectId }],
    status: { type: String, default: "failed" },
    started: { type: Number, default: 0 },
    startDateTime: { type: Date },
  },
  { timestamps: true },
);

const nitrogenTestFormModel = mongoose.model(
  "nitrogenTestForms",
  nitrogenTestFormSchema,
);

module.exports = nitrogenTestFormModel;
