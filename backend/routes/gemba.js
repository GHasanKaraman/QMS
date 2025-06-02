const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const gembaModel = require("../models/gembaModel");

router.get("/gemba", async (req, res) => {
  try {
    const gemba = await gembaModel.find({});

    if (gemba) {
      res.status(200).json({
        gemba,
      });
      console.log("Fetched all gemba data sheet results!");
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

router.post("/gemba/get", async (req, res) => {
  try {
    const { id } = req.body;
    const gemba = await gembaModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
    ]);
    if (gemba) {
      res.status(200).json({
        gemba: gemba[0],
      });
      console.log("Fetched " + id + " gemba data sheet result!");
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

router.use("/gemba/add", async (req, res) => {
  try {
    const data = req.body;
    var status = undefined;
    if (data.questions.filter(({ answer }) => answer === "Fail").length === 0) {
      status = "passed";
    }

    const form = await gembaModel.create({
      ...data,
      status,
      username: req.username,
    });

    if (form) {
      console.log(req.username + " successfully created a GEMBA form!");
      res.status(200).json({ form });
    } else {
      console.log("Something went wrong while creating GEMBA form!");
      res.sendStatus(500);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

module.exports = router;
