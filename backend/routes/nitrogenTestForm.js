const express = require("express");
const router = express.Router();
const upload = require("../file");

const imageModel = require("../models/imageModel");
const nitrogenTestFormModel = require("../models/nitrogenTestFormModel.js");
const mongoose = require("mongoose");
const { sendQAC } = require("../qac.js");
const {
  getNextStage,
  applyStage,
  logStage,
  buildRetest,
  claimRetest,
} = require("../utils/sampleStages.js");

const PREFIX = "nitrogen";

// Both screen photos are required before the end stage can be saved
const hasAllPhotos = (form) =>
  Boolean(form.leftImageID) &&
  (form.hasRightSide === "No" || Boolean(form.rightImageID));

// Attaches newly uploaded screen photos. A side's photo can't be replaced
// once attached.
const attachPhotos = async (form, savedImages) => {
  const sides = { leftPicture: "leftImageID", rightPicture: "rightImageID" };
  const newImages = savedImages.filter(
    ({ fieldname }) =>
      sides[fieldname] &&
      !form[sides[fieldname]] &&
      (fieldname === "leftPicture" || form.hasRightSide !== "No"),
  );
  if (newImages.length === 0) return;
  const result = await imageModel.insertMany(newImages);
  newImages.forEach(({ fieldname }, i) => {
    form[sides[fieldname]] = result[i]._id;
  });
};

// Applies the stage results and photos sent with a stage.
// Returns false when something required is missing.
const applyNitrogenStage = async (form, req, stage) => {
  if (!applyStage(form, req.body, PREFIX, stage)) return false;
  await attachPhotos(form, req.savedImages);
  return stage !== "End" || hasAllPhotos(form);
};

const logNitrogenStage = (form, stage, username) =>
  logStage(form, PREFIX, stage, username, {}, hasAllPhotos);

const sendFormSubmit = (form, req) =>
  sendQAC("formSubmit", {
    formType: "nitrogenTest",
    station: form.station,
    product: form.product,
    ip: req.ip,
    username: req.username,
    formStatus: form.status,
  });

router.post("/nitrogentest/get", async (req, res) => {
  try {
    const { id } = req.body;
    const nitrogenTestForm = await nitrogenTestFormModel.aggregate([
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
    if (nitrogenTestForm.length === 1) {
      var details = {
        part: nitrogenTestForm[0].product,
        ip: req.ip,
      };

      const product = await sendQAC("recipe", details);

      const { leftImageID, rightImageID } = nitrogenTestForm[0];
      const images = await imageModel.find({
        _id: { $in: [leftImageID, rightImageID].filter(Boolean) },
      });
      const findImage = (imageID) =>
        imageID ? images.find((image) => image._id.equals(imageID)) : null;

      res.status(200).json({
        nitrogenTestForm: nitrogenTestForm[0],
        images: [findImage(leftImageID), findImage(rightImageID)],
        product: product,
      });
      console.log("Fetched " + id + " nitrogen test data sheet result!");
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

// Latest nitrogen test of the given run that still needs work: either
// unfinished (to continue) or failed and not retested yet (to retest)
router.post("/nitrogentest/inprogress", async (req, res) => {
  try {
    const { station, product, started } = req.body;
    const form = await nitrogenTestFormModel
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

router.post("/nitrogentest/add", upload, async (req, res) => {
  try {
    const data = req.body;
    if (!data.product || data.product === "undefined" || !data.lotCode) {
      console.log("Something went wrong when saving the form!");
      return res.sendStatus(405);
    }

    const form = new nitrogenTestFormModel({
      station: data.station,
      shift: data.shift,
      product: data.product,
      lotCode: data.lotCode,
      hasRightSide: data.hasRightSide === "No" ? "No" : "Yes",
      started: data.started,
      startDateTime: data.startDateTime,
      username: req.username,
    });

    if (!(await applyNitrogenStage(form, req, "Beginning"))) {
      console.log("Nitrogen test beginning samples are missing!");
      return res.sendStatus(405);
    }
    logNitrogenStage(form, "Beginning", req.username);
    await form.save();

    console.log(req.username + " successfully created a nitrogen test form!");
    await sendFormSubmit(form, req);
    res.status(200).json({ form });
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

// Records the next stage (middle or end) of an open nitrogen test.
// Filled stages can't be changed and failed forms are closed.
router.post("/nitrogentest/update", upload, async (req, res) => {
  try {
    const { id, stage } = req.body;
    const form = await nitrogenTestFormModel.findById(id);
    if (!form) {
      return res.sendStatus(404);
    }
    if (form.completed || stage !== getNextStage(form, PREFIX)) {
      console.log(
        "Nitrogen test " + id + " " + stage + " stage can't be filled!",
      );
      return res.sendStatus(409);
    }
    if (!(await applyNitrogenStage(form, req, stage))) {
      console.log("Nitrogen test " + stage + " samples are missing!");
      return res.sendStatus(405);
    }
    logNitrogenStage(form, stage, req.username);
    await form.save();

    console.log(
      req.username + " filled the " + stage + " stage of nitrogen test " + id,
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

// Retests a failed nitrogen test: creates a new linked form that keeps the
// stages before the failed one and records the failed stage again. Screen
// photos are not carried over, the retest needs its own.
router.post("/nitrogentest/retest", upload, async (req, res) => {
  try {
    const { id } = req.body;
    const original = await nitrogenTestFormModel.findById(id);
    if (!original) {
      return res.sendStatus(404);
    }
    if (original.status !== "failed" || original.retestedBy) {
      console.log("Nitrogen test " + id + " can't be retested!");
      return res.sendStatus(409);
    }

    const { form, stage } = buildRetest(
      nitrogenTestFormModel,
      original,
      PREFIX,
      req.username,
    );
    if (!applyStage(form, req.body, PREFIX, stage)) {
      console.log("Nitrogen test retest " + stage + " samples are missing!");
      return res.sendStatus(405);
    }

    if (!(await claimRetest(nitrogenTestFormModel, original._id, form._id))) {
      console.log("Nitrogen test " + id + " has already been retested!");
      return res.sendStatus(409);
    }
    try {
      await attachPhotos(form, req.savedImages);
      if (stage === "End" && !hasAllPhotos(form)) {
        console.log("Nitrogen test retest is missing screen photos!");
        await nitrogenTestFormModel.updateOne({ _id: id }, { retestedBy: null });
        return res.sendStatus(405);
      }
      logNitrogenStage(form, stage, req.username);
      await form.save();
    } catch (err) {
      await nitrogenTestFormModel.updateOne({ _id: id }, { retestedBy: null });
      throw err;
    }

    console.log(
      req.username + " retested nitrogen test " + id + " as " + form._id,
    );
    await sendFormSubmit(form, req);
    res.status(200).json({ form });
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

module.exports = router;
