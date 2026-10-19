const mongoose = require("mongoose");

const leakTestFormSchema = new mongoose.Schema(
  {
    station: { type: String, required: true },
    shift: { type: String, required: true },
    product: { type: String, required: true },
    username: { type: String, required: true },
    lotCode: { type: String, required: true },
    leakLeftBeginning: { type: String, required: true },
    leakLeftMiddle: { type: String, required: true },
    leakLeftEnd: { type: String, required: true },
    leakLeftDefects: { type: Number, required: true, min: 0 },
    leakRightBeginning: { type: String, required: true },
    leakRightMiddle: { type: String, required: true },
    leakRightEnd: { type: String, required: true },
    leakRightDefects: { type: Number, required: true, min: 0 },
    status: { type: String, default: "failed" },
    started: { type: Number, default: 0 },
    startDateTime: { type: Date },
  },
  { timestamps: true },
);

const leakTestFormModel = mongoose.model("leakTestForms", leakTestFormSchema);

module.exports = leakTestFormModel;
