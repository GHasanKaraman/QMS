const express = require("express");
const router = express.Router();

const metalDetectorFormModel = require("../models/metalDetectorFormModel");

router.use("/metaldetector/add", async (req, res) => {
  try {
    const form = await metalDetectorFormModel.create({
      ...req.body,
      username: req.username,
    });

    if (form) {
      console.log(
        req.username + " successfully created a metal detector form!"
      );
      res.status(200).json({ form });
    } else {
      console.log("Something went wrong while creating metal detector form!");
      res.sendStatus(500);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

module.exports = router;
