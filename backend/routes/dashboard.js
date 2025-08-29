const express = require("express");
const router = express.Router();

const ratioFormModel = require("../models/ratioFormModel");
const qualityControlFormModel = require("../models/qualityControlFormModel");
const metalDetectorFormModel = require("../models/metalDetectorFormModel");
const xRayFormModel = require("../models/xRayFormModel.js");
const labelInspectionFormModel = require("../models/labelInspectionFormModel");
const pgQualityControlFormModel = require("../models/pgQualityControlFormModel");
const lotInspectionFormModel = require("../models/lotInspectionFormModel");
const preOperationalFormModel = require("../models/preOperationalFormModel.js");
const mixingQualityFormModel = require("../models/mixingQualityFormModel");
const roastingQualityFormModel = require("../models/roastingQualityFormModel.js");
const ccpFormModel = require("../models/ccpFormModel.js");

const { sendQAC } = require("../qac.js");

router.use("/dashboard", async (req, res) => {
  try {
    var now = new Date();
    var startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const data = await sendQAC("stations", { ip: req.ip }, "GET", undefined);

    const pipeline = [
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "formID",
          as: "comments",
        },
      },
      {
        $lookup: {
          from: "signoffs",
          localField: "_id",
          foreignField: "formID",
          as: "signoffs",
        },
      },
      { $match: { createdAt: { $gte: startOfToday } } },
    ];

    const ratioForms = await ratioFormModel.aggregate(pipeline);
    const qualityControlForms = await qualityControlFormModel.aggregate(
      pipeline
    );
    const pgQualityControlForms = await pgQualityControlFormModel.aggregate(
      pipeline
    );
    const xRayForms = await xRayFormModel.aggregate(pipeline);
    const metalDetectorForms = await metalDetectorFormModel.aggregate(pipeline);
    const labelInspectionForms = await labelInspectionFormModel.aggregate(
      pipeline
    );
    const preOperationalForms = await preOperationalFormModel.aggregate(
      pipeline
    );
    const mixingQualityForms = await mixingQualityFormModel.aggregate(pipeline);
    const roastingQualityForms = await roastingQualityFormModel.aggregate(
      pipeline
    );
    const lotInspectionForms = await lotInspectionFormModel.aggregate(pipeline);
    const ccpForms = await ccpFormModel.aggregate(pipeline);
    if (
      data &&
      ratioForms &&
      qualityControlForms &&
      mixingQualityForms &&
      roastingQualityForms &&
      metalDetectorForms &&
      xRayForms &&
      labelInspectionForms &&
      pgQualityControlForms &&
      preOperationalForms &&
      lotInspectionForms
    ) {
      res.status(200).json({
        locations: data,
        forms: [
          ...ratioForms,
          ...xRayForms,
          ...mixingQualityForms,
          ...preOperationalForms,
          ...qualityControlForms,
          ...metalDetectorForms,
          ...labelInspectionForms,
          ...lotInspectionForms,
          ...pgQualityControlForms,
          ...roastingQualityForms,
          ...ccpForms,
        ],
      });
      console.log("Fetched all locations from OC DB!");
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

module.exports = router;
