const express = require("express");

const router = express.Router();
const upload = require("../file");

const imageModel = require("../models/imageModel");
const lotInspectionFormModel = require("../models/lotInspectionFormModel");
const mongoose = require("mongoose");

const { sendQAC } = require("../qac.js");

router.post("/lotinspection/get", async (req, res) => {
  try {
    const { id } = req.body;
    const lotInspectionForm = await lotInspectionFormModel.aggregate([
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
    //if (lotInspectionForm.length === 1) {
    var details = {
      part: lotInspectionForm[0].product,
      ip: req.ip,
    };

    const product = await sendQAC("recipe", details);

    const images = await imageModel.find({
      _id: { $in: lotInspectionForm[0].imageIDs },
    });
    if (images) {
      res.status(200).json({
        lotInspectionForm: lotInspectionForm[0],
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

router.post("/lotinspection/add", upload, async (req, res) => {
  try {
    const imageDetails = req.savedImages;

    const result = await imageModel.insertMany(imageDetails);
    if (result) {
      const formInformations = req.body;
      var status = undefined;
      if (formInformations.itemCode1 && formInformations.lotCode1) {
        status = "passed";
      }
      const imageIDs = result.map((info) => info._id);

      if (
        formInformations.product &&
        formInformations.product !== "undefined"
      ) {
        const form = await lotInspectionFormModel.create({
          ...formInformations,
          imageIDs,
          username: req.username,
          status,
        });
        if (form) {
          console.log(
            req.username + " successfully created a lot inspection form!"
          );
          await sendQAC("formSubmit", {
            formType: "lotInspection",
            station: formInformations.station,
            product: formInformations.product,
            ip: req.ip,
            username: req.username,
            formStatus: status,
          });
          res.status(200).json({ form });
        } else {
          console.log(
            "Something went wrong while creating lot inspection form!"
          );
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
