const express = require("express");
const router = express.Router();
const upload = require("../file");

const imageModel = require("../models/imageModel");
const nitrogenTestFormModel = require("../models/nitrogenTestFormModel.js");
const mongoose = require("mongoose");
const { sendQAC } = require("../qac.js");

const SAMPLE_FIELDS = [
  "nitrogenLeftBeginning",
  "nitrogenLeftMiddle",
  "nitrogenLeftEnd",
  "nitrogenRightBeginning",
  "nitrogenRightMiddle",
  "nitrogenRightEnd",
];

router.post("/nitrogentest/get", async (req, res) => {
  try {
    const { id } = req.body;
    const nitrogenTestForm = await nitrogenTestFormModel.aggregate([
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
    if (nitrogenTestForm.length === 1) {
      var details = {
        part: nitrogenTestForm[0].product,
        ip: req.ip,
      };

      const product = await sendQAC("recipe", details);

      const imageIDs = nitrogenTestForm[0].imageIDs || [];
      const found = await imageModel.find({ _id: { $in: imageIDs } });
      // Keep the left/right order of imageIDs
      const images = imageIDs.map((imageID) =>
        found.find((image) => image._id.equals(imageID)),
      );

      res.status(200).json({
        nitrogenTestForm: nitrogenTestForm[0],
        images: images,
        product: product,
      });
      console.log("Fetched " + id + " nitrogen test data sheet result!");
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

router.post("/nitrogentest/add", upload, async (req, res) => {
  try {
    const imageDetails = req.savedImages;
    const formInformations = req.body;

    if (imageDetails.length !== 2) {
      console.log("Nitrogen test form requires left and right screen photos!");
      return res.sendStatus(405);
    }

    if (formInformations.product && formInformations.product !== "undefined") {
      const result = await imageModel.insertMany(imageDetails);
      if (result) {
        var status = "failed";
        if (
          formInformations.lotCode &&
          SAMPLE_FIELDS.every((field) => formInformations[field] === "Pass")
        ) {
          status = "passed";
        }
        const imageIDs = result.map((info) => info._id);

        const form = await nitrogenTestFormModel.create({
          ...formInformations,
          imageIDs,
          username: req.username,
          status,
        });
        if (form) {
          console.log(
            req.username + " successfully created a nitrogen test form!",
          );
          await sendQAC("formSubmit", {
            formType: "nitrogenTest",
            station: formInformations.station,
            product: formInformations.product,
            ip: req.ip,
            username: req.username,
            formStatus: status,
          });
          res.status(200).json({ form });
        } else {
          console.log("Something went wrong while creating nitrogen test form!");
          res.sendStatus(500);
        }
      } else {
        console.log("Image info has not been written in the database!");
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
