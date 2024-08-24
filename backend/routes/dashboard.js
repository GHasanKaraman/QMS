const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();

const ratioFormModel = require("../models/ratioFormModel");
const qualityControlFormModel = require("../models/qualityControlFormModel");
const metalDetectorFormModel = require("../models/metalDetectorFormModel");
const xRayFormModel = require("../models/xRayFormModel.js");
const labelInspectionFormModel = require("../models/labelInspectionFormModel");
const pgQualityControlFormModel = require("../models/pgQualityControlFormModel");
const lotInspectionFormModel = require("../models/lotInspectionFormModel");
const preOperationalFormModel = require("../models/preOperationalFormModel.js");

router.use("/dashboard", async (req, res) => {
  try {
    const resp = await fetch("http://10.12.0.15:81/qac.php?stations", {
      method: "GET",
    });
    var now = new Date();
    var startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    const data = await resp.json();

    const ratioForms = await ratioFormModel.find({});
    const qualityControlForms = await qualityControlFormModel.find({
      createdAt: { $gte: startOfToday },
    });
    const pgQualityControlForms = await pgQualityControlFormModel.find({
      createdAt: { $gte: startOfToday },
    }); //
    const xRayForms = await xRayFormModel.find({
      createdAt: { $gte: startOfToday },
    });
    const metalDetectorForms = await metalDetectorFormModel.find({
      createdAt: { $gte: startOfToday },
    });
    const labelInspectionForms = await labelInspectionFormModel.find({
      createdAt: { $gte: startOfToday },
    });
    const preOperationalForms = await preOperationalFormModel.find({
      createdAt: { $gte: startOfToday },
    });
    const lotInspectionForms = await lotInspectionFormModel.find({
      createdAt: { $gte: startOfToday },
    });
    if (
      data &&
      ratioForms &&
      qualityControlForms &&
      metalDetectorForms &&
      xRayForms &&
      labelInspectionForms &&
      pgQualityControlForms &&
      preOperationalForms &&
      lotInspectionForms
    ) {
      res.status(200).json({
        locations: data,
        ratioForms: ratioForms,
        xRayForms: xRayForms,
        preOperationalForms: preOperationalForms,
        qualityControlForms: qualityControlForms,
        metalDetectorForms: metalDetectorForms,
        labelInspectionForms: labelInspectionForms,
        lotInspectionForms: lotInspectionForms,
        pgQualityControlForms: pgQualityControlForms,
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
