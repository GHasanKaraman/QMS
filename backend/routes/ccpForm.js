const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();
const mongoose = require("mongoose");

const ccpFormModel = require("../models/ccpFormModel.js");

router.post("/ccp/get", async (req, res) => {
  try {
    const { id } = req.body;
    const ccpForm = await ccpFormModel.aggregate([
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
    if (ccpForm.length === 1) {
      var details = {
        part: ccpForm[0].product,
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
          ccpForm: ccpForm[0],
          product: product,
        });
        console.log("Fetched " + id + " CCP data sheet result!");
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

router.post("/ccp/add", async (req, res) => {
  try {
    const data = req.body;
    var status = undefined;
    if (
      data.rawTemperature >= 65 &&
      4.5 <= data.moistureContent <= 6.5 &&
      data.chamberSet1 === 345 &&
      320 <= data.chamberActual1 <= 416 &&
      data.chamberSet2 === 342 &&
      337 <= data.chamberActual2 <= 372 &&
      data.chamberSet3 === 342 &&
      338 <= data.chamberActual3 <= 372 &&
      data.chamberSet4 === 342 &&
      338 <= data.chamberActual4 <= 356 &&
      data.chamberSet5 === 335 &&
      334 <= data.chamberActual5 <= 348 &&
      data.chamberSet6 === 335 &&
      334 <= data.chamberActual6 <= 337 &&
      data.chamberSet7 === 335 &&
      336 <= data.chamberActual7 <= 338 &&
      data.chamberSet8 === 335 &&
      337 <= data.chamberActual8 <= 352 &&
      data.fan1 === 40 &&
      data.fan2 === 40 &&
      data.fan3 === 40 &&
      data.fan4 === 40 &&
      data.fan5 === 40 &&
      data.fan6 === 40 &&
      data.fan7 === 50 &&
      data.fan8 === 50 &&
      data.zoneCooling === 55 &&
      data.bedDepth === 6.2 &&
      data.beltSpeed === 21
    ) {
      status = "passed";
    }

    const form = await ccpFormModel.create({
      ...data,
      status,
      username: req.username,
    });

    if (form) {
      console.log(req.username + " successfully created a CCP-2 form!");
      res.status(200).json({ form });
    } else {
      console.log("Something went wrong while creating CCP-2 form!");
      res.sendStatus(500);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

module.exports = router;
