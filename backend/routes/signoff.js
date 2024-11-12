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
const signOffModel = require("../models/signOffModel.js");
const lotInspectionFormModel = require("../models/lotInspectionFormModel");

router.post("/signoff", async (req, res) => {
  try {
    const { forms } = req.body;
    if (req.access.includes("S")) {
      const list = forms.map((form) => {
        return { formID: form, signedOff: req.username };
      });
      const form = await signOffModel.insertMany(list);
      if (form.length > 0) {
        res.status(201).json({ forms: form });
        console.log(req.username + " signed off the forms!");
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
    const lotInspectionForms = await lotInspectionFormModel.find({
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
