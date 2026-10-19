const express = require("express");
const router = express.Router();

const leakTestFormModel = require("../models/leakTestFormModel.js");
const mongoose = require("mongoose");
const { sendQAC } = require("../qac.js");

const LEFT_FIELDS = ["leakLeftBeginning", "leakLeftMiddle", "leakLeftEnd"];
const RIGHT_FIELDS = ["leakRightBeginning", "leakRightMiddle", "leakRightEnd"];

router.post("/leaktest/get", async (req, res) => {
  try {
    const { id } = req.body;
    const leakTestForm = await leakTestFormModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "signoffs",
          localField: "_id",
          foreignField: "formID",
          as: "signOff",
        },
      },
      { $unwind: { preserveNullAndEmptyArrays: true, path: "$signOff" } },
    ]);
    if (leakTestForm.length === 1) {
      var details = {
        part: leakTestForm[0].product,
        ip: req.ip,
      };

      const product = await sendQAC("recipe", details);

      res.status(200).json({
        leakTestForm: leakTestForm[0],
        product: product,
      });
      console.log("Fetched " + id + " leak test data sheet result!");
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

router.post("/leaktest/add", async (req, res) => {
  try {
    const data = req.body;
    const hasRightSide = data.hasRightSide !== "No";
    if (!hasRightSide) {
      [...RIGHT_FIELDS, "leakRightDefects"].forEach((field) => {
        delete data[field];
      });
    }
    const SAMPLE_FIELDS = hasRightSide
      ? [...LEFT_FIELDS, ...RIGHT_FIELDS]
      : LEFT_FIELDS;
    var status = "failed";
    if (
      data.lotCode &&
      SAMPLE_FIELDS.every((field) => data[field] === "Pass")
    ) {
      status = "passed";
    }
    if (data.product && data.product !== "undefined") {
      const form = await leakTestFormModel.create({
        ...data,
        status,
        username: req.username,
      });

      if (form) {
        console.log(req.username + " successfully created a leak test form!");
        await sendQAC("formSubmit", {
          formType: "leakTest",
          station: data.station,
          product: data.product,
          ip: req.ip,
          username: req.username,
          formStatus: status,
        });
        res.status(200).json({ form });
      } else {
        console.log("Something went wrong while creating leak test form!");
        res.sendStatus(500);
      }
    } else {
      console.log("Something went wrong when saving the form!");
      res.sendStatus(405);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

module.exports = router;
