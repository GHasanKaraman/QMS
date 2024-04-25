const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();

const ratioFormModel = require("../models/ratioFormModel");
const qualityControlFormModel = require("../models/qualityControlFormModel");
const metalDetectorFormModel = require("../models/metalDetectorFormModel");
const labelInspectionFormModel = require("../models/labelInspectionFormModel");
const pgQualityControlFormModel = require("../models/pgQualityControlFormModel");

router.use("/signoff/dashboard", async (req, res) => {
  try {
    const { start, end } = req.body;
    const resp = await fetch("http://10.12.0.15:81/qac.php?stations", {
      method: "GET",
    });

    var s = new Date(start);
    var e = new Date(end);

    const data = await resp.json();
    const ratioForms = await ratioFormModel.find({});
    const qualityControlForms = await qualityControlFormModel.find({
      createdAt: { $gte: new Date(s), $lte: new Date(e) },
    });
    const pgQualityControlForms = await pgQualityControlFormModel.find({
      createdAt: { $gte: new Date(s), $lte: new Date(e) },
    });
    const metalDetectorForms = await metalDetectorFormModel.find({
      createdAt: { $gte: new Date(s), $lte: new Date(e) },
    });
    const labelInspectionForms = await labelInspectionFormModel.find({
      createdAt: { $gte: new Date(s), $lte: new Date(e) },
    });
    if (
      data &&
      ratioForms &&
      qualityControlForms &&
      metalDetectorForms &&
      labelInspectionForms &&
      pgQualityControlForms
    ) {
      res.status(200).json({
        locations: data,
        ratioForms: ratioForms,
        qualityControlForms: qualityControlForms,
        metalDetectorForms: metalDetectorForms,
        labelInspectionForms: labelInspectionForms,
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
