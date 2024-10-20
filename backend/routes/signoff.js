const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();

const essentials = require("../utils/essentials");
const ratioFormModel = require("../models/ratioFormModel");
const qualityControlFormModel = require("../models/qualityControlFormModel");
const metalDetectorFormModel = require("../models/metalDetectorFormModel");
const labelInspectionFormModel = require("../models/labelInspectionFormModel");
const pgQualityControlFormModel = require("../models/pgQualityControlFormModel");
const xRayFormModel = require("../models/xRayFormModel.js");
const mixingQualityFormModel = require("../models/mixingQualityFormModel");
const preOperationalFormModel = require("../models/preOperationalFormModel.js");
const signOffModel = require("../models/signOffModel.js");

router.post("/signoff", async (req, res) => {
  try {
    const { id } = req.body;
    if (req.access.includes("S")) {
      const form = await signOffModel.create({
        formID: id,
        signedOff: req.username,
        signOffDate: essentials.getEST(),
      });
      if (form._id) {
        res.sendStatus(201);
        console.log(req.username + " signed off " + id + "!");
      } else {
        res.sendStatus(400);
      }
    } else {
      res.sendStatus(406);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

router.post("/signoff/dashboard", async (req, res) => {
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
    const xRayForms = await xRayFormModel.find({
      createdAt: { $gte: new Date(s), $lte: new Date(e) },
    });
    const preOperationalForms = await preOperationalFormModel.find({
      createdAt: { $gte: new Date(s), $lte: new Date(e) },
    });
    const mixingQualityForms = await mixingQualityFormModel.find({
      createdAt: { $gte: new Date(s), $lte: new Date(e) },
    });
    if (
      data &&
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
        locations: data,
        ratioForms: ratioForms,
        qualityControlForms: qualityControlForms,
        metalDetectorForms: metalDetectorForms,
        labelInspectionForms: labelInspectionForms,
        pgQualityControlForms: pgQualityControlForms,
        xRayForms: xRayForms,
        preOperationalForms: preOperationalForms,
        mixingQualityForms: mixingQualityForms,
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
