const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();

const essentials = require("../utils/essentials");
const xRayFormModel = require("../models/xRayFormModel.js");

router.post("/xray/get", async (req, res) => {
  try {
    const { id } = req.body;
    const xRayForm = await xRayFormModel.find({ _id: id });
    if (xRayForm) {
      var details = {
        part: xRayForm[0].product,
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
          xRayForm: xRayForm[0],
          product: product,
        });
        console.log("Fetched " + id + " X-Ray inspection data sheet result!");
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

router.post("/xray/signoff", async (req, res) => {
  try {
    const { id } = req.body;
    if (req.access.includes("S")) {
      const xRayForm = await xRayFormModel.updateOne(
        { _id: id },
        { signedOff: req.username, signOffDate: essentials.getEST() },
      );
      if (xRayForm.modifiedCount == 1) {
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

router.post("/xray/add", async (req, res) => {
  try {
    const data = req.body;
    var status = undefined;
    if (data.lotCode && data.personBeingObserved) {
      status = "passed";
    }

    const form = await xRayFormModel.create({
      ...data,
      status,
      username: req.username,
    });

    if (form) {
      console.log(req.username + " successfully created a X-Ray form!");
      res.status(200).json({ form });
    } else {
      console.log("Something went wrong while creating X-Ray form!");
      res.sendStatus(500);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

module.exports = router;
