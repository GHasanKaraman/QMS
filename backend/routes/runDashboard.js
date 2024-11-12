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
    const qualityControlForms = await qualityControlFormModel.aggregate([
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
    ]);
    const pgQualityControlForms = await pgQualityControlFormModel.aggregate([
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
    ]);
    const metalDetectorForms = await metalDetectorFormModel.aggregate([
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
    ]);
    const labelInspectionForms = await labelInspectionFormModel.aggregate([
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
    ]);
    const xRayForms = await xRayFormModel.aggregate([
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
    ]);
    const preOperationalForms = await preOperationalFormModel.aggregate([
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
    ]);
    const mixingQualityForms = await mixingQualityFormModel.aggregate([
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
    ]);
    const lotInspectionForms = await lotInspectionFormModel.aggregate([
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
    ]);

    const forms = [
      ...ratioForms,
      ...xRayForms,
      ...mixingQualityForms,
      ...preOperationalForms,
      ...qualityControlForms,
      ...metalDetectorForms,
      ...labelInspectionForms,
      ...lotInspectionForms,
      ...pgQualityControlForms,
    ];

    var details = {
      part: Array.from(new Set(forms.flatMap((item) => item.product))),
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
      mixingQualityForms
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
