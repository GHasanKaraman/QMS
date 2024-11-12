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

router.post("/runsummary", async (req, res) => {
  try {
    const { station, product, date } = req.body;

    const s = new Date(date);
    const e = new Date(date);
    e.setDate(s.getDate() + 1);

    const ratioForms = await ratioFormModel.find({ station });
    const qualityControlForms = await qualityControlFormModel.aggregate([
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
    ]);
    const pgQualityControlForms = await pgQualityControlFormModel.aggregate([
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
    ]);
    const metalDetectorForms = await metalDetectorFormModel.aggregate([
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
    ]);
    const labelInspectionForms = await labelInspectionFormModel.aggregate([
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
    ]);
    const xRayForms = await xRayFormModel.aggregate([
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
    ]);
    const preOperationalForms = await preOperationalFormModel.aggregate([
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
    ]);
    const mixingQualityForms = await mixingQualityFormModel.aggregate([
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
    ]);
    const lotInspectionForms = await lotInspectionFormModel.aggregate([
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
    ]);
    var details = { part: [product] };
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
        desc,
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
