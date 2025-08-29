const express = require("express");
const router = express.Router();

const ratioFormModel = require("../models/ratioFormModel");
const qualityControlFormModel = require("../models/qualityControlFormModel");
const metalDetectorFormModel = require("../models/metalDetectorFormModel");
const labelInspectionFormModel = require("../models/labelInspectionFormModel");
const pgQualityControlFormModel = require("../models/pgQualityControlFormModel");
const xRayFormModel = require("../models/xRayFormModel.js");
const mixingQualityFormModel = require("../models/mixingQualityFormModel");
const roastingQualityFormModel = require("../models/roastingQualityFormModel.js");
const preOperationalFormModel = require("../models/preOperationalFormModel.js");
const lotInspectionFormModel = require("../models/lotInspectionFormModel");
const ccpFormModel = require("../models/ccpFormModel.js");
const { sendQAC } = require("../qac.js");

router.post("/runsummary", async (req, res) => {
  try {
    const { station, product, dateStart, dateEnd } = req.body;

    const s = new Date(dateStart);
    const e = new Date(dateEnd);
    e.setSeconds(e.getSeconds() + 1);

    const pipeline = [
      {
        $match: {
          createdAt: { $gte: new Date(s), $lte: new Date(e) },
          station,
          product,
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
    ];

    const ratioForms = await ratioFormModel.aggregate(pipeline);
    const qualityControlForms = await qualityControlFormModel.aggregate(
      pipeline
    );
    const pgQualityControlForms = await pgQualityControlFormModel.aggregate(
      pipeline
    );
    const metalDetectorForms = await metalDetectorFormModel.aggregate(pipeline);
    const labelInspectionForms = await labelInspectionFormModel.aggregate(
      pipeline
    );
    const xRayForms = await xRayFormModel.aggregate(pipeline);
    const preOperationalForms = await preOperationalFormModel.aggregate(
      pipeline
    );
    const mixingQualityForms = await mixingQualityFormModel.aggregate(pipeline);
    const roastingQualityForms = await roastingQualityFormModel.aggregate(
      pipeline
    );
    const lotInspectionForms = await lotInspectionFormModel.aggregate(pipeline);
    const ccpForms = await ccpFormModel.aggregate(pipeline);

    var details = { part: [product], ip: req.ip };

    const desc = await sendQAC("desc", details);

    if (
      ratioForms &&
      qualityControlForms &&
      metalDetectorForms &&
      labelInspectionForms &&
      pgQualityControlForms &&
      xRayForms &&
      preOperationalForms &&
      mixingQualityForms &&
      roastingQualityForms &&
      ccpForms
    ) {
      res.status(200).json({
        desc,
        forms: [
          ...ratioForms,
          ...xRayForms,
          ...mixingQualityForms,
          ...roastingQualityForms,
          ...preOperationalForms,
          ...qualityControlForms,
          ...metalDetectorForms,
          ...labelInspectionForms,
          ...lotInspectionForms,
          ...pgQualityControlForms,
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
