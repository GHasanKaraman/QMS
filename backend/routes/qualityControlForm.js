const express = require("express");
const fetch = require("node-fetch");
const sharp = require("sharp");
const mongoose = require("mongoose");

const router = express.Router();
const upload = require("../file");

const imageModel = require("../models/imageModel");
const qualityControlModel = require("../models/qualityControlFormModel");

router.post("/qualitycontrol", async (req, res) => {
  try {
    const resp = await fetch("http://10.12.0.15:81/qac.php?stations", {
      method: "GET",
    });

    const data = await resp.json();
    if (data) {
      res.status(200).json({ stations: data });
      console.log("Fetched all locations from OC DB!");
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

router.post("/qualitycontrol/stationplan", async (req, res) => {
  try {
    const { station, shift } = req.body;

    var details = {
      station: station,
      runDate: new Date().toLocaleDateString(),
      runShift: shift,
      ip: req.ip,
    };

    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");

    const resp = await fetch("http://10.12.0.15:81/qac.php?stationPlan", {
      method: "POST",
      body: formBody,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
    });
    const data = await resp.json();
    console.log(data);
    if (data) {
      res.status(200).json({ products: data });
      console.log("Fetched all products over " + station + " from OC DB!");
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

router.post("/qualitycontrol/getproduct", async (req, res) => {
  try {
    const { station, product } = req.body;

    var details = {
      station: station,
      prod: product,
      ip: req.ip,
    };

    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");

    const resp = await fetch("http://10.12.0.15:81/qac.php?getProduct", {
      method: "POST",
      body: formBody,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
    });
    const data = await resp.json();
    console.log(data);
    if (data) {
      res.status(200).json({ details: data });
      console.log(
        "Fetched all details over " +
          station +
          " and " +
          product +
          " from OC DB!"
      );
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});
router.post("/qualitycontrol/get", async (req, res) => {
  try {
    const { id } = req.body;
    const qualityControlForm = await qualityControlModel.aggregate([
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
    //if (qualityControlForm.length === 1) {
    var details = {
      part: qualityControlForm[0].product,
      ip: req.ip,
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
    const images = await imageModel.find({
      _id: { $in: qualityControlForm[0].imageIDs },
    });
    if (images) {
      res.status(200).json({
        qualityControlForm: qualityControlForm[0],
        images: images,
        product: product,
      });
      console.log(
        "Fetched " + id + " quality control inspection data sheet result!"
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

router.post("/qualitycontrol/add", upload, async (req, res) => {
  try {
    const imageDetails = req.savedImages;

    const result = await imageModel.insertMany(imageDetails);
    if (result) {
      const formInformations = req.body;
      var status = undefined;
      if (
        formInformations.areIngredientsCorrect !== "No" &&
        formInformations.isTasteAcceptable !== "Unacceptable" &&
        formInformations.isSealCorrect === "Yes" &&
        formInformations.isNotchCorrect !== "No" &&
        formInformations.xrayFeDetected !== "No" &&
        formInformations.xrayNonFeDetected !== "No" &&
        formInformations.xraySsDetected !== "No" &&
        formInformations.xrayGlassDetected !== "No" &&
        formInformations.xrayCeramicDetected !== "No" &&
        formInformations.xrayGlass10Detected !== "No" &&
        formInformations.xrayCeramic10Detected !== "No" &&
        formInformations.xrayGlass7Detected !== "No" &&
        formInformations.xrayCeramic8Detected !== "No" &&
        formInformations.metalCardFeDetected !== "No" &&
        formInformations.metalCardNonFeDetected !== "No" &&
        formInformations.metalCardSsDetected !== "No" &&
        formInformations.metalBallSingleFeDetected !== "No" &&
        formInformations.metalBallSingleNonFeDetected !== "No" &&
        formInformations.metalBallSingleSsDetected !== "No" &&
        formInformations.metalBallMultipleFeDetected !== "No" &&
        formInformations.metalBallMultipleNonFeDetected !== "No" &&
        formInformations.metalBallMultipleSsDetected !== "No" &&
        formInformations.areAllergensCorrect === "Yes" &&
        formInformations.allergenStatement !== "No" &&
        formInformations.labelPackageCorrect !== "No" &&
        formInformations.unitsCase !== "No"
      ) {
        status = "passed";
      }
      const imageIDs = result.map((info) => info._id);
      const form = await qualityControlModel.create({
        ...formInformations,
        imageIDs,
        username: req.username,
        status,
      });
      if (form) {
        console.log(
          req.username + " successfully created a quality control form!"
        );
        res.status(200).json({ form });
      } else {
        console.log(
          "Something went wrong while creating quality control form!"
        );
        res.sendStatus(500);
      }
    } else {
      console.log("Image info has not been written in the database!");
      res.sendStatus(500);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

module.exports = router;
