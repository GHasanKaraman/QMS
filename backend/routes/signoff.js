const express = require("express");
const router = express.Router();
const moment = require("moment");

const ratioFormModel = require("../models/ratioFormModel");
const qualityControlFormModel = require("../models/qualityControlFormModel");
const metalDetectorFormModel = require("../models/metalDetectorFormModel");
const labelInspectionFormModel = require("../models/labelInspectionFormModel");
const pgQualityControlFormModel = require("../models/pgQualityControlFormModel");
const xRayFormModel = require("../models/xRayFormModel.js");
const mixingQualityFormModel = require("../models/mixingQualityFormModel");
const roastingQualityFormModel = require("../models/roastingQualityFormModel");
const preOperationalFormModel = require("../models/preOperationalFormModel.js");
const signOffModel = require("../models/signOffModel.js");
const lotInspectionFormModel = require("../models/lotInspectionFormModel");
const ccpFormModel = require("../models/ccpFormModel.js");
const { sendQAC } = require("../qac.js");

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

router.post("/signoff/dashboard/stations", async (req, res) => {
  try {
    const data = await sendQAC("stations", undefined, "GET", undefined);

    if (data) {
      res.status(200).json({ stations: data });
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

router.post("/signoff/dashboard", async (req, res) => {
  try {
    const { page, station, itemCode, before, after } = req.body;

    const limit = 4;

    const afterDays = after ? parseInt(after) : null;
    const beforeDays = before ? parseInt(before) : null;

    const filters = {};

    if (afterDays !== null) {
      filters.createdAt = {
        ...filters.createdAt,
        $gte: moment().subtract(after, "days").toDate(),
      };
    }

    if (beforeDays !== null) {
      filters.createdAt = {
        ...filters.createdAt,
        $lte: moment().subtract(before, "days").toDate(),
      };
    }
    if (station !== null) {
      filters.station = station;
    }

    if (itemCode !== null) {
      filters.product = { $regex: itemCode, $options: "i" };
    }

    const pipeline = [
      {
        $lookup: {
          from: "signoffs",
          localField: "_id",
          foreignField: "formID",
          as: "signoffs",
        },
      },
    ];

    if (Object.keys(filters).length > 0) {
      pipeline.push({ $match: filters });
    }

    const data = await sendQAC("stations", undefined, "GET", undefined);

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

    forms.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    const groupedRecordsObject = forms.reduce((groups, record) => {
      const recordDate = moment(record.createdAt)
        .startOf("day")
        .format("YYYY-MM-DD"); // Group by date
      if (!groups[recordDate]) {
        groups[recordDate] = [];
      }
      groups[recordDate].push(record);
      return groups;
    }, {});

    const groupedRecords = Object.values(groupedRecordsObject);

    const skip = (page - 1) * limit;
    const paginatedGroups = groupedRecords.slice(skip, skip + limit);
    const totalCount = groupedRecords.length;
    const totalPages = Math.ceil(totalCount / limit);
    const totalForms = forms.filter(
      (form) => form.signoffs.length === 0,
    ).length;

    const products = Array.from(new Set(forms.map((form) => form.product)));

    var details = { part: products, ip: req.ip };

    const desc = await sendQAC("desc", details);

    if (
      data &&
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
        stations: data,
        forms: paginatedGroups,
        totalCount,
        totalPages,
        currentPage: page,
        totalForms,
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
