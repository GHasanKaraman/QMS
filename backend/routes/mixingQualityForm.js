const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const essentials = require("../utils/essentials");
const mixingQualityFormModel = require("../models/mixingQualityFormModel.js");
const upload = require("../file");
const imageModel = require("../models/imageModel");

const { sendQAC } = require("../qac.js");

router.post("/mixingquality/get", async (req, res) => {
  try {
    const { id } = req.body;
    const mixingQualityForm = await mixingQualityFormModel.aggregate([
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
    //   if (mixingQualityForm.length === 1) {
    var details = {
      part: mixingQualityForm[0].product,
      ip: req.ip,
    };

    const product = sendQAC("recipe", details);
    const images = await imageModel.find({
      _id: { $in: mixingQualityForm[0].imageIDs },
    });

    if (images) {
      res.status(200).json({
        mixingQualityForm: mixingQualityForm[0],
        product: product,
        images,
      });
      console.log("Fetched " + id + " Mixing Quality form data sheet result!");
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

router.post("/mixingquality/add", upload, async (req, res) => {
  try {
    const imageDetails = req.savedImages;

    const result = await imageModel.insertMany(imageDetails);
    if (result) {
      const data = req.body;
      var status = undefined;
      if (
        data.correctLabel !== "No" &&
        data.probioticMixLot !== "No" &&
        data.allergensSeparate === "Yes" &&
        data.sensory === "Yes" &&
        data.cleanFloor === "Yes" &&
        data.areAllergensCorrect === "Yes" &&
        data.garbageOrganized === "Yes"
      ) {
        status = "passed";
      }

      const imageIDs = result.map((info) => info._id);
      const form = await mixingQualityFormModel.create({
        ...data,
        imageIDs,
        status,
        username: req.username,
      });

      if (form) {
        console.log(
          req.username + " successfully created a Mixing Quality form!"
        );
        sendQAC("formSubmit", {
          formType: "mixingQuality",
          station: data.station,
          product: data.product,
          ip: req.ip,
        });
        res.status(200).json({ form });
      } else {
        console.log("Something went wrong while creating Mixing Quality form!");
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
