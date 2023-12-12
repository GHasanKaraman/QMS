const express = require("express");
const router = express.Router();

const ratioFormModel = require("../models/ratioFormModel");
const qualityControlFormModel = require("../models/qualityControlFormModel");

router.use("/dashboard", async (req, res) => {
  try {
    const resp = await fetch("http://10.12.0.15:81/qac.php?stations", {
      method: "GET",
    });

    const data = await resp.json();
    const ratioForms = await ratioFormModel.find({});
    const qualityControlForms = await qualityControlFormModel.find({});
    if (data && ratioForms && qualityControlForms) {
      res.status(200).json({
        locations: data,
        ratioForms: ratioForms,
        qualityControlForms: qualityControlForms,
      });
      console.log("Fetched all locations from OC DB!");
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

module.exports = router;
