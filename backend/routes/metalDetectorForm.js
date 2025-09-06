const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const metalDetectorFormModel = require("../models/metalDetectorFormModel");

const { sendQAC } = require("../qac.js");

router.post("/metaldetector/get", async (req, res) => {
  try {
    const { id } = req.body;
    const metalDetectorForm = await metalDetectorFormModel.aggregate([
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
    // if (metalDetectorForm.length === 1) {
    var details = {
      part: metalDetectorForm[0].product,
      ip: req.ip,
    };
    const product = await sendQAC("recipe", details);
    if (product) {
      res.status(200).json({
        metalDetectorForm: metalDetectorForm[0],
        product: product,
      });
      console.log(
        "Fetched " + id + " metal detector inspection data sheet result!"
      );
    } else {
      res.sendStatus(404);
    }
    /*} else {
      res.sendStatus(404);
    }*/
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

router.use("/metaldetector/add", async (req, res) => {
  try {
    const data = req.body;
    var status = undefined;
    if (data.lotCode && data.personBeingObserved && data.ballOrCard) {
      status = "passed";
    }

    if (data.product) {
      const form = await metalDetectorFormModel.create({
        ...data,
        status,
        username: req.username,
      });

      if (form) {
        console.log(
          req.username + " successfully created a metal detector form!"
        );
        await sendQAC("formSubmit", {
          formType: "metalDetector",
          station: data.station,
          product: data.product,
          ip: req.ip,
          username: req.username,
          formStatus: status,
        });
        res.status(200).json({ form });
      } else {
        console.log("Something went wrong while creating metal detector form!");
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
