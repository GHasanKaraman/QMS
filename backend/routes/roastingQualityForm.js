const express = require("express");
const fetch = require("node-fetch");
const sharp = require("sharp");
const mongoose = require("mongoose");
const router = express.Router();

const upload = require("../file");
const imageModel = require("../models/imageModel");
const roastingQualityFormModel = require("../models/roastingQualityFormModel");

router.post("/roastingquality/get", async (req, res) => {
  try {
    const { id } = req.body;
    const roastingQualityForm = await roastingQualityFormModel.aggregate([
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
    // if (roastingQualityForm.length === 1) {
    var details = {
      part: roastingQualityForm[0].product,
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
      _id: { $in: roastingQualityForm[0].imageIDs },
    });

    if (images) {
      res.status(200).json({
        roastingQualityForm: roastingQualityForm[0],
        product: product,
        images,
      });
      console.log(
        "Fetched " + id + " Roasting Quality form data sheet result!"
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
const getStatus = (data) => {
  const station = data.station;
  if (station === "ROAST-1") {
    return (
      data.areAllergensCorrect === "Yes" &&
      data.sensoryEvaluation === "Yes" &&
      data.productThickness === "Yes" &&
      data.colorOfFinishedProduct === "Yes"
    );
  } else if (station === "ROAST-M5") {
    return (
      data.areAllergensCorrect === "Yes" &&
      data.colorOfFinishedProduct === "Yes" &&
      data.sensoryEvaluation === "Yes"
    );
  } else {
    return (
      data.areAllergensCorrect === "Yes" &&
      data.sensoryEvaluation === "Yes" &&
      data.productThickness === "Yes" &&
      data.colorOfFinishedProduct === "Yes"
    );
  }
};
router.post("/roastingquality/add", upload, async (req, res) => {
  try {
    const imageDetails = req.savedImages;

    const result = await imageModel.insertMany(imageDetails);
    if (result) {
      const data = req.body;
      var status = undefined;
      if (getStatus(data)) {
        status = "passed";
      }

      const imageIDs = result.map((info) => info._id);
      const form = await roastingQualityFormModel.create({
        ...data,
        imageIDs,
        status,
        username: req.username,
      });

      if (form) {
        console.log(
          req.username + " successfully created a Roasting Quality form!"
        );
        res.status(200).json({ form });
      } else {
        console.log(
          "Something went wrong while creating Roasting Quality form!"
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
