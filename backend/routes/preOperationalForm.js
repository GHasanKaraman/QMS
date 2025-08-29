const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const preOperationalFormModel = require("../models/preOperationalFormModel.js");
const { sendQAC } = require("../qac.js");

router.post("/preoperational/get", async (req, res) => {
  try {
    const { id } = req.body;
    const preOperationalForm = await preOperationalFormModel.aggregate([
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
    // if (preOperationalForm.length === 1) {
    var details = {
      part: preOperationalForm[0].product,
      ip: req.ip,
    };

    const product = await sendQAC("recipe", details);

    if (product) {
      res.status(200).json({
        preOperationalForm: preOperationalForm[0],
        product: product,
      });
      console.log(
        "Fetched " + id + " Pre-Operational inspection data sheet result!"
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

router.post("/preoperational/add", async (req, res) => {
  try {
    const data = req.body;
    var status = undefined;
    if (
      data.dumper !== "No" &&
      data.elevator !== "No" &&
      data.metalDetector !== "No" &&
      data.conveyor !== "No" &&
      data.sealer !== "No" &&
      data.turntable !== "No" &&
      data.platform !== "No" &&
      data.floor !== "No" &&
      data.drum !== "No" &&
      data.belts !== "No" &&
      data.goodCondition === "Pass" &&
      data.noLoose === "Pass" &&
      data.noChemicals === "Pass" &&
      data.noGlass === "Pass" &&
      data.garbageRemoved === "Pass" &&
      data.wearingCoat === "Pass" &&
      data.complyingGMP === "Pass" &&
      data.noSick === "Pass" &&
      data.okStart === "Yes"
    ) {
      status = "passed";
    }

    const form = await preOperationalFormModel.create({
      ...data,
      status,
      username: req.username,
    });

    if (form) {
      console.log(
        req.username + " successfully created a Pre-Operational form!"
      );
      await sendQAC("formSubmit", {
        formType: "preOperational",
        station: data.station,
        product: data.product,
        ip: req.ip,
      });
      res.status(200).json({ form });
    } else {
      console.log("Something went wrong while creating Pre-Operational form!");
      res.sendStatus(500);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

module.exports = router;
