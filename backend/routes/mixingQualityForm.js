const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();

const essentials = require("../utils/essentials");
const mixingQualityFormModel = require("../models/mixingQualityFormModel.js");

router.post("/mixingquality/get", async (req, res) => {
  try {
    const { id } = req.body;
    const mixingQualityForm = await mixingQualityFormModel.find({ _id: id });
    if (mixingQualityForm) {
      var details = {
        part: mixingQualityForm[0].product,
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
          mixingQualityForm: mixingQualityForm[0],
          product: product,
        });
        console.log(
          "Fetched " + id + " Mixing Quality form data sheet result!",
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

router.post("/mixingquality/signoff", async (req, res) => {
  try {
    const { id } = req.body;
    if (req.access.includes("S")) {
      const mixingQualityForm = await mixingQualityFormModel.updateOne(
        { _id: id },
        { signedOff: req.username, signOffDate: essentials.getEST() },
      );
      if (mixingQualityForm.modifiedCount == 1) {
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

router.post("/mixingquality/add", async (req, res) => {
  try {
    const data = req.body;
    var status = undefined;
    if (
      data.correctLabel !== "No" &&
      data.probioticMixLot !== "No" &&
      data.cleaning !== "Quality" &&
      data.allergensSeparate === "Yes" &&
      data.sensory === "Yes" &&
      data.cleanFloor === "Yes" &&
      data.garbageOrganized === "Yes"
    ) {
      status = "passed";
    }

    const form = await mixingQualityFormModel.create({
      ...data,
      status,
      username: req.username,
    });

    if (form) {
      console.log(
        req.username + " successfully created a Mixing Quality form!",
      );
      res.status(200).json({ form });
    } else {
      console.log("Something went wrong while creating Mixing Quality form!");
      res.sendStatus(500);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

module.exports = router;
