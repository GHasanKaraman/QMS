const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();

const ratioFormModel = require("../models/ratioFormModel");
const qualityControlFormModel = require("../models/qualityControlFormModel");
const metalDetectorFormModel = require("../models/metalDetectorFormModel");
const labelInspectionFormModel = require("../models/labelInspectionFormModel");
const pgQualityControlFormModel = require("../models/pgQualityControlFormModel");
const xRayFormModel = require("../models/xRayFormModel.js");
const mixingQualityFormModel = require("../models/mixingQualityFormModel");
const preOperationalFormModel = require("../models/preOperationalFormModel.js");
const lotInspectionFormModel = require("../models/lotInspectionFormModel");

router.post("/rundashboard", async (req, res) => {
  try {
    const { station } = req.body;
    const today = new Date();

    const s = new Date(today);
    const e = new Date(today);
    s.setDate(today.getDate() - 14);

    const ratioForms = await ratioFormModel.find({ station });
    const qualityControlForms = await qualityControlFormModel.find({
      createdAt: { $gte: new Date(s), $lte: new Date(e) },
      station,
    });
    const pgQualityControlForms = await pgQualityControlFormModel.find({
      createdAt: { $gte: new Date(s), $lte: new Date(e) },
      station,
    });
    const metalDetectorForms = await metalDetectorFormModel.find({
      createdAt: { $gte: new Date(s), $lte: new Date(e) },
      station,
    });
    const labelInspectionForms = await labelInspectionFormModel.find({
      createdAt: { $gte: new Date(s), $lte: new Date(e) },
      station,
    });
    const xRayForms = await xRayFormModel.find({
      createdAt: { $gte: new Date(s), $lte: new Date(e) },
      station,
    });
    const preOperationalForms = await preOperationalFormModel.find({
      createdAt: { $gte: new Date(s), $lte: new Date(e) },
      station,
    });
    const mixingQualityForms = await mixingQualityFormModel.find({
      createdAt: { $gte: new Date(s), $lte: new Date(e) },
      station,
    });
    const lotInspectionForms = await lotInspectionFormModel.find({
      createdAt: { $gte: new Date(s), $lte: new Date(e) },
      station,
    });

    if (
      ratioForms &&
      qualityControlForms &&
      metalDetectorForms &&
      labelInspectionForms &&
      pgQualityControlForms &&
      xRayForms &&
      preOperationalForms &&
      mixingQualityForms
    ) {
      res.status(200).json({
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
