const express = require("express");
const router = express.Router();

const essentials = require("../utils/essentials");
const xRayFormModel = require("../models/xRayFormModel.js");
const mongoose = require("mongoose");
const { sendQAC } = require("../qac.js");

router.post("/xray/get", async (req, res) => {
  try {
    const { id } = req.body;
    const xRayForm = await xRayFormModel.aggregate([
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
    if (xRayForm.length === 1) {
      var details = {
        part: xRayForm[0].product,
        ip: req.ip,
      };

      const product = await sendQAC("recipe", details);

      if (product) {
        res.status(200).json({
          xRayForm: xRayForm[0],
          product: product,
        });
        console.log("Fetched " + id + " X-Ray inspection data sheet result!");
      } else {
        res.sendStatus(404);
      }
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

router.post("/xray/add", async (req, res) => {
  try {
    const data = req.body;
    var status = undefined;
    if (data.lotCode && data.personBeingObserved) {
      status = "passed";
    }
    if (data.product) {
      const form = await xRayFormModel.create({
        ...data,
        status,
        username: req.username,
      });

      if (form) {
        console.log(req.username + " successfully created a X-Ray form!");
        await sendQAC("formSubmit", {
          formType: "xray",
          station: data.station,
          product: data.product,
          ip: req.ip,
          username: req.username,
          formStatus: status,
        });
        res.status(200).json({ form });
      } else {
        console.log("Something went wrong while creating X-Ray form!");
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
