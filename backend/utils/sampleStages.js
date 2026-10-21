// Shared logic for forms that are filled in stages over a run
// (Beginning -> Middle -> End), e.g. leak test and nitrogen test.
//
// A form is closed (completed) when every stage is filled or as soon as a
// sample fails. A failed form can be retested once: the retest is a new form
// linked to it (retestOf / retestedBy) that carries over the stages before the
// failed one and continues from the failed stage.

const mongoose = require("mongoose");

const STAGES = ["Beginning", "Middle", "End"];
const RESULTS = ["Pass", "Fail"];

const stageFields = (prefix, stage, hasRightSide) => {
  const fields = [prefix + "Left" + stage];
  if (hasRightSide) fields.push(prefix + "Right" + stage);
  return fields;
};

// The first stage whose left sample has not been recorded yet,
// or undefined when every stage is filled.
const getNextStage = (form, prefix) =>
  STAGES.find((stage) => !form[prefix + "Left" + stage]);

// The first stage with a failed sample, or undefined
const getFailedStage = (form, prefix) =>
  STAGES.find((stage) =>
    stageFields(prefix, stage, form.hasRightSide !== "No").some(
      (field) => form[field] === "Fail",
    ),
  );

// "failed" as soon as any recorded sample fails, "passed" once every stage is
// filled with passes (and extra completion checks hold), else "inProgress".
const computeStatus = (form, prefix, isComplete = () => true) => {
  if (!form.lotCode || getFailedStage(form, prefix)) return "failed";
  if (getNextStage(form, prefix) === undefined && isComplete(form)) {
    return "passed";
  }
  return "inProgress";
};

// Copies the given stage's results from the request body onto the form.
// Returns false when a required result is missing or invalid.
const applyStage = (form, body, prefix, stage) => {
  const fields = stageFields(prefix, stage, form.hasRightSide !== "No");
  if (!fields.every((field) => RESULTS.includes(body[field]))) return false;
  fields.forEach((field) => {
    form[field] = body[field];
  });
  return true;
};

// Records who filled the stage and updates the status of the form
const logStage = (form, prefix, stage, username, extra = {}, isComplete) => {
  form.stageLog.push({ stage, username, recordedAt: new Date(), ...extra });
  form.status = computeStatus(form, prefix, isComplete);
  form.completed =
    form.status === "failed" || getNextStage(form, prefix) === undefined;
};

// Builds (without saving) the retest of a failed form. Returns the new form
// and the stage it continues from.
const buildRetest = (Model, original, prefix, username) => {
  const failedStage = getFailedStage(original, prefix);
  const hasRightSide = original.hasRightSide !== "No";
  const carried = STAGES.slice(0, STAGES.indexOf(failedStage));

  const form = new Model({
    _id: new mongoose.Types.ObjectId(),
    station: original.station,
    shift: original.shift,
    product: original.product,
    lotCode: original.lotCode,
    hasRightSide: original.hasRightSide,
    started: original.started,
    startDateTime: original.startDateTime,
    username,
    retestOf: original._id,
    attempt: (original.attempt || 1) + 1,
  });
  carried.forEach((stage) => {
    stageFields(prefix, stage, hasRightSide).forEach((field) => {
      form[field] = original[field];
    });
    original.stageLog
      .filter((log) => log.stage === stage)
      .forEach((log) => {
        form.stageLog.push({
          ...log.toObject(),
          _id: undefined,
          recordedAt: log.recordedAt || log.createdAt,
          carriedFrom: original._id,
        });
      });
  });
  return { form, stage: failedStage };
};

// Marks the original as retested, unless someone else already retested it
const claimRetest = (Model, originalID, retestID) =>
  Model.findOneAndUpdate(
    { _id: originalID, status: "failed", retestedBy: null },
    { retestedBy: retestID },
  );

module.exports = {
  STAGES,
  getNextStage,
  getFailedStage,
  computeStatus,
  applyStage,
  logStage,
  buildRetest,
  claimRetest,
};
