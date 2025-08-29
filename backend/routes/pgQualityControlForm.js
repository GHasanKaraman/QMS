const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();
const upload = require("../file");

const imageModel = require("../models/imageModel");
const pgQualityControlModel = require("../models/pgQualityControlFormModel");

const { sendQAC } = require("../qac.js");

router.post("/pgqualitycontrol", async (req, res) => {
  try {
    const data = await sendQAC("stations", undefined, "GET", undefined);

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

router.post("/pgqualitycontrol/stationplan", async (req, res) => {
  try {
    const { station, shift } = req.body;

    var details = {
      station: station,
      runDate: new Date().toLocaleDateString(),
      runShift: shift,
      ip: req.ip,
    };

    const data = await sendQAC("stationPlan", details);

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

router.post("/pgqualitycontrol/getproduct", async (req, res) => {
  try {
    const { station, product } = req.body;

    var details = {
      station: station,
      prod: product,
      ip: req.ip,
    };

    const data = await sendQAC("getProduct", details);

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
router.post("/pgqualitycontrol/get", async (req, res) => {
  try {
    const { id } = req.body;
    const qualityControlForm = await pgQualityControlModel.aggregate([
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

    const product = await sendQAC("recipe", details);

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

router.post("/pgqualitycontrol/add", upload, async (req, res) => {
  try {
    const imageDetails = req.savedImages;

    const result = await imageModel.insertMany(imageDetails);
    if (result) {
      const formInformations = req.body;
      var status = undefined;
      if (
        formInformations.isSealCorrectPouch === "Yes" &&
        formInformations.isNotchCorrect === "Yes" &&
        formInformations.metalDetector === "Yes" &&
        formInformations.isSealCorrectBox === "Yes" &&
        formInformations.areIngredientsCorrect === "Yes" &&
        formInformations.metalBallFeDetected !== "No" &&
        formInformations.metalBallNonFeDetected !== "No" &&
        formInformations.metalBallSsDetected !== "No"
      ) {
        status = "passed";
      }
      const imageIDs = result.map((info) => info._id);
      const form = await pgQualityControlModel.create({
        ...formInformations,
        imageIDs,
        username: req.username,
        status,
      });
      if (form) {
        console.log(
          req.username + " successfully created a P&G quality control form!"
        );
        await sendQAC("formSubmit", {
          formType: "p&g",
          station: formInformations.station,
          product: formInformations.product,
          ip: req.ip,
        });
        res.status(200).json({ form });
      } else {
        console.log(
          "Something went wrong while creating a P&G quality control form!"
        );
        res.sendStatus(500);
      }
    } else {
      console.log("Image info has not been written in the database!");
      res.sendStatus(500);
    }
    console.log(result);
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

module.exports = router;
