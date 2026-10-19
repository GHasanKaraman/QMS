const mongoose = require("mongoose");

const nitrogenTestFormSchema = new mongoose.Schema(
  {
    station: { type: String, required: true },
    shift: { type: String, required: true },
    product: { type: String, required: true },
    username: { type: String, required: true },
    lotCode: { type: String, required: true },
    nitrogenLeftBeginning: { type: String, required: true },
    nitrogenLeftMiddle: { type: String, required: true },
    nitrogenLeftEnd: { type: String, required: true },
    nitrogenRightBeginning: { type: String, required: true },
    nitrogenRightMiddle: { type: String, required: true },
    nitrogenRightEnd: { type: String, required: true },
    // [0] = left side screen photo, [1] = right side screen photo
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
