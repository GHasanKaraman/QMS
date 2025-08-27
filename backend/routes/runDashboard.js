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
const roastingQualityFormModel = require("../models/roastingQualityFormModel.js");
const preOperationalFormModel = require("../models/preOperationalFormModel.js");
const lotInspectionFormModel = require("../models/lotInspectionFormModel");
const ccpFormModel = require("../models/ccpFormModel.js");

router.post("/rundashboard", async (req, res) => {
  try {
    const { station } = req.body;
    const today = new Date();

    const s = new Date(today);
    const e = new Date(today);
    s.setDate(today.getDate() - 14);

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
      {
        $match: {
          createdAt: { $gte: new Date(s), $lte: new Date(e) },
          station,
        },
      },
    ];

    const ratioForms = await ratioFormModel.aggregate(pipeline);
    const qualityControlForms =
      await qualityControlFormModel.aggregate(pipeline);
    const pgQualityControlForms =
      await pgQualityControlFormModel.aggregate(pipeline);
    const metalDetectorForms = await metalDetectorFormModel.aggregate(pipeline);
    const labelInspectionForms =
      await labelInspectionFormModel.aggregate(pipeline);
    const xRayForms = await xRayFormModel.aggregate(pipeline);
    const preOperationalForms =
      await preOperationalFormModel.aggregate(pipeline);
    const mixingQualityForms = await mixingQualityFormModel.aggregate(pipeline);
    const roastingQualityForms =
      await roastingQualityFormModel.aggregate(pipeline);
    const lotInspectionForms = await lotInspectionFormModel.aggregate(pipeline);
    const ccpForms = await ccpFormModel.aggregate(pipeline);

    const forms = [
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
    ];

    var details = {
      part: Array.from(new Set(forms.flatMap((item) => item.product))),
      ip: req.ip,
    };

    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");

    const resp = await fetch("http://10.12.0.15:81/qac.php?desc", {
      method: "POST",
      body: formBody,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
    });
    const desc = await resp.json();

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
        forms,
        desc,
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
