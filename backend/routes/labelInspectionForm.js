const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();

const essentials = require("../utils/essentials");
const labelInspectionFormModel = require("../models/labelInspectionFormModel");

router.post("/operators", async (req, res) => {
  try {
    const resp = await fetch("http://10.12.0.15:81/qac.php?qcNames", {
      method: "POST",
    });

    const data = await resp.json();
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
    const labelInspectionForm = await labelInspectionFormModel.find({
      _id: id,
    });
    if (labelInspectionForm) {
      var details = {
        part: labelInspectionForm[0].product,
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
          labelInspectionForm: labelInspectionForm[0],
          product: product,
        });
        console.log("Fetched " + id + " label inspection data sheet result!");
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

router.post("/labelinspection/signoff", async (req, res) => {
  try {
    const { id } = req.body;
    if (req.access === "S") {
      const labelInspectionForm = await labelInspectionFormModel.updateOne(
        { _id: id },
        { signedOff: req.username, signOffDate: essentials.getEST() }
      );
      if (labelInspectionForm.modifiedCount == 1) {
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
