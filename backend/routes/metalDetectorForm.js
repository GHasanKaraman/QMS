const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();
const mongoose = require("mongoose");

const metalDetectorFormModel = require("../models/metalDetectorFormModel");

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
    };
    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");

    const resp = await fetch("http://10.12.0.15:81/qac.php?recipe", {
      method: "POST",
      body: formBody,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
    });
    const product = await resp.json();
    if (product) {
      res.status(200).json({
        metalDetectorForm: metalDetectorForm[0],
        product: product,
      });
      console.log(
        "Fetched " + id + " metal detector inspection data sheet result!",
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

    const form = await metalDetectorFormModel.create({
      ...data,
      status,
      username: req.username,
    });

    if (form) {
      console.log(
        req.username + " successfully created a metal detector form!",
      );
      res.status(200).json({ form });
    } else {
      console.log("Something went wrong while creating metal detector form!");
      res.sendStatus(500);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

module.exports = router;
