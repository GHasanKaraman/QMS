const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();

const essentials = require("../utils/essentials");
const preOperationalFormModel = require("../models/preOperationalFormModel.js");

router.post("/preoperational/get", async (req, res) => {
  try {
    const { id } = req.body;
    const preOperationalForm = await preOperationalFormModel.find({ _id: id });
    if (preOperationalForm) {
      var details = {
        part: preOperationalForm[0].product,
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
          preOperationalForm: preOperationalForm[0],
          product: product,
        });
        console.log(
          "Fetched " + id + " Pre-Operational inspection data sheet result!",
        );
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

router.post("/preoperational/signoff", async (req, res) => {
  try {
    const { id } = req.body;
    if (req.access.includes("S")) {
      const preOperationalForm = await preOperationalFormModel.updateOne(
        { _id: id },
        { signedOff: req.username, signOffDate: essentials.getEST() },
      );
      if (preOperationalForm.modifiedCount == 1) {
        res.sendStatus(200);
      } else {
        res.sendStatus(400);
      }
    } else {
      res.sendStatus(406);
    }
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
        req.username + " successfully created a Pre-Operational form!",
      );
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
