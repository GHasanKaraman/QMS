const mongoose = require("mongoose");

const stageLogSchema = new mongoose.Schema(
  {
    stage: { type: String, required: true },
    username: { type: String, required: true },
    recordedAt: { type: Date },
    // Set when the stage was copied from the failed form this one retests
    carriedFrom: { type: mongoose.Types.ObjectId },
  },
  { timestamps: true },
);

// Filled in stages: the form is created with the beginning samples and the
// middle and end samples are added later in the run.
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
    nitrogenLeftMiddle: { type: String, default: "" },
    nitrogenLeftEnd: { type: String, default: "" },
    nitrogenRightBeginning: { type: String, default: "" },
    nitrogenRightMiddle: { type: String, default: "" },
    nitrogenRightEnd: { type: String, default: "" },
    // Nitrogen screen photos; can be attached at any stage, required by the end
    leftImageID: { type: mongoose.Types.ObjectId, default: null },
    rightImageID: { type: mongoose.Types.ObjectId, default: null },
    stageLog: [stageLogSchema],
    // Closed when every stage is filled or a sample has failed
    completed: { type: Boolean, default: false },
    // Retest chain: a failed form is retested by a new linked form
    retestOf: { type: mongoose.Types.ObjectId, default: null },
    retestedBy: { type: mongoose.Types.ObjectId, default: null },
    attempt: { type: Number, default: 1 },
    status: { type: String, default: "inProgress" },
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
