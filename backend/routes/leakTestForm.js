const express = require("express");
const router = express.Router();

const leakTestFormModel = require("../models/leakTestFormModel.js");
const mongoose = require("mongoose");
const { sendQAC } = require("../qac.js");
const {
  getNextStage,
  applyStage,
  logStage,
  buildRetest,
  claimRetest,
} = require("../utils/sampleStages.js");

const PREFIX = "leak";

const parseDefects = (value) => {
  const number = Number(value);
  return value !== "" && Number.isInteger(number) && number >= 0
    ? number
    : undefined;
};

// Applies the defect counts sent with a stage. They are running totals for the
// run, so every stage sends the current count for each side.
const applyDefects = (form, body) => {
  const left = parseDefects(body.leakLeftDefects);
  if (left === undefined) return false;
  form.leakLeftDefects = left;
  if (form.hasRightSide !== "No") {
    const right = parseDefects(body.leakRightDefects);
    if (right === undefined) return false;
    form.leakRightDefects = right;
  }
  return true;
};

const logLeakStage = (form, stage, username) =>
  logStage(form, PREFIX, stage, username, {
    leftDefects: form.leakLeftDefects,
    rightDefects:
      form.hasRightSide !== "No" ? form.leakRightDefects : undefined,
  });

const sendFormSubmit = (form, req) =>
  sendQAC("formSubmit", {
    formType: "leakTest",
    station: form.station,
    product: form.product,
    ip: req.ip,
    username: req.username,
    formStatus: form.status,
  });

router.post("/leaktest/get", async (req, res) => {
  try {
    const { id } = req.body;
    const leakTestForm = await leakTestFormModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "signoffs",
          localField: "_id",
          foreignField: "formID",
          as: "signOff",
        },
      },
      { $unwind: { preserveNullAndEmptyArrays: true, path: "$signOff" } },
    ]);
    if (leakTestForm.length === 1) {
      var details = {
        part: leakTestForm[0].product,
        ip: req.ip,
      };

      const product = await sendQAC("recipe", details);

      res.status(200).json({
        leakTestForm: leakTestForm[0],
        product: product,
      });
      console.log("Fetched " + id + " leak test data sheet result!");
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

// Latest leak test of the given run that still needs work: either unfinished
// (to continue) or failed and not retested yet (to retest)
router.post("/leaktest/inprogress", async (req, res) => {
  try {
    const { station, product, started } = req.body;
    const form = await leakTestFormModel
      .findOne({
        station,
        product,
        started: Number(started) || 0,
        $or: [{ completed: false }, { status: "failed", retestedBy: null }],
      })
      .sort({ createdAt: -1 });
    res.status(200).json({ form });
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

router.post("/leaktest/add", async (req, res) => {
  try {
    const data = req.body;
    if (!data.product || data.product === "undefined" || !data.lotCode) {
      console.log("Something went wrong when saving the form!");
      return res.sendStatus(405);
    }

    const form = new leakTestFormModel({
      station: data.station,
      shift: data.shift,
      product: data.product,
      lotCode: data.lotCode,
      hasRightSide: data.hasRightSide === "No" ? "No" : "Yes",
      started: data.started,
      startDateTime: data.startDateTime,
      username: req.username,
    });

    if (
      !applyStage(form, data, PREFIX, "Beginning") ||
      !applyDefects(form, data)
    ) {
      console.log("Leak test beginning samples are missing!");
      return res.sendStatus(405);
    }
    logLeakStage(form, "Beginning", req.username);
    await form.save();

    console.log(req.username + " successfully created a leak test form!");
    await sendFormSubmit(form, req);
    res.status(200).json({ form });
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

// Records the next stage (middle or end) of an open leak test.
// Filled stages can't be changed and failed forms are closed.
router.post("/leaktest/update", async (req, res) => {
  try {
    const { id, stage } = req.body;
    const form = await leakTestFormModel.findById(id);
    if (!form) {
      return res.sendStatus(404);
    }
    if (form.completed || stage !== getNextStage(form, PREFIX)) {
      console.log("Leak test " + id + " " + stage + " stage can't be filled!");
      return res.sendStatus(409);
    }
    if (
      !applyStage(form, req.body, PREFIX, stage) ||
      !applyDefects(form, req.body)
    ) {
      console.log("Leak test " + stage + " samples are missing!");
      return res.sendStatus(405);
    }
    logLeakStage(form, stage, req.username);
    await form.save();

    console.log(
      req.username + " filled the " + stage + " stage of leak test " + id,
    );
    if (form.completed) {
      await sendFormSubmit(form, req);
    }
    res.status(200).json({ form });
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

// Retests a failed leak test: creates a new linked form that keeps the stages
// before the failed one and records the failed stage again.
router.post("/leaktest/retest", async (req, res) => {
  try {
    const { id } = req.body;
    const original = await leakTestFormModel.findById(id);
    if (!original) {
      return res.sendStatus(404);
    }
    if (original.status !== "failed" || original.retestedBy) {
      console.log("Leak test " + id + " can't be retested!");
      return res.sendStatus(409);
    }

    const { form, stage } = buildRetest(
      leakTestFormModel,
      original,
      PREFIX,
      req.username,
    );
    if (
      !applyStage(form, req.body, PREFIX, stage) ||
      !applyDefects(form, req.body)
    ) {
      console.log("Leak test retest " + stage + " samples are missing!");
      return res.sendStatus(405);
    }
    logLeakStage(form, stage, req.username);

    if (!(await claimRetest(leakTestFormModel, original._id, form._id))) {
      console.log("Leak test " + id + " has already been retested!");
      return res.sendStatus(409);
    }
    try {
      await form.save();
    } catch (err) {
      await leakTestFormModel.updateOne({ _id: id }, { retestedBy: null });
      throw err;
    }

    console.log(
      req.username + " retested leak test " + id + " as " + form._id,
    );
    await sendFormSubmit(form, req);
    res.status(200).json({ form });
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

module.exports = router;
