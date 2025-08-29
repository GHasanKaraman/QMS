const express = require("express");
const router = express.Router();

const labelInspectionFormModel = require("../models/labelInspectionFormModel");
const mongoose = require("mongoose");

const { sendQAC } = require("../qac.js");

router.post("/operators", async (req, res) => {
  try {
    const data = sendQAC("qcNames", undefined, "POST", undefined);

    if (data) {
      res.status(200).json({
        operators: data,
      });
      console.log("Fetched all operators from OC DB!");
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

router.post("/labelinspection/get", async (req, res) => {
  try {
    const { id } = req.body;
    const labelInspectionForm = await labelInspectionFormModel.aggregate([
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
    //if (labelInspectionForm.length === 1) {
    var details = {
      part: labelInspectionForm[0].product,
      ip: req.ip,
    };

    const product = sendQAC("recipe", details);

    if (product) {
      res.status(200).json({
        labelInspectionForm: labelInspectionForm[0],
        product: product,
      });
      console.log("Fetched " + id + " label inspection data sheet result!");
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

router.use("/labelinspection/add", async (req, res) => {
  try {
    const data = req.body;
    var status = undefined;
    if (
      data.lotCode &&
      data.personBeingObserved &&
      data.isAllergenStatementCorrect !== "No"
    ) {
      status = "passed";
    }
    const form = await labelInspectionFormModel.create({
      ...data,
      status,
      username: req.username,
    });

    if (form) {
      console.log(
        req.username + " successfully created a label inspection form!"
      );
      sendQAC("formSubmit", {
        formType: "labelInspection",
        station: data.station,
        product: data.product,
        ip: req.ip,
      });
      res.status(200).json({ form });
    } else {
      console.log("Something went wrong while creating label inspection form!");
      res.sendStatus(500);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

module.exports = router;
