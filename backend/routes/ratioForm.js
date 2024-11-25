const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();

const mongoose = require("mongoose");
const ratioFormModel = require("../models/ratioFormModel");

router.post("/ratio/get", async (req, res) => {
  try {
    const { id } = req.body;
    const ratioForm = await ratioFormModel.aggregate([
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
    if (ratioForm.length === 1) {
      var details = {
        part: ratioForm[0].product,
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
          ratioForm: ratioForm[0],
          product: product,
        });
        console.log("Fetched " + id + " Ratio data sheet result!");
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
router.post("/ratio/recipe", async (req, res) => {
  try {
    const { product } = req.body;
    var details = {
      part: product,
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
    const recipe = await resp.json();
    if (recipe) {
      res.status(200).json({
        recipe: recipe,
      });
      console.log("Fetched recipe of " + product + " !");
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

router.post("/ratio/add", async (req, res) => {
  try {
    const { station, product, weights } = req.body;
    var status = true;

    const totalWeight = Object.values(weights).reduce(
      (prev, curr) => prev + curr.weight * 1.0,
      0,
    );

    Object.values(weights).forEach((weight) => {
      const percentage = weight.ratio * 0.1;
      const toleranceMin = weight.ratio - percentage;
      const toleranceMax = weight.ratio + percentage;
      const customQty = ((weight.weight * 1.0) / totalWeight) * 1.0;
      status = status && customQty <= toleranceMax && toleranceMin <= customQty;
      if (status === false) {
        return;
      }
    });

    if (status === true) {
      status = "passed";
    } else {
      status = undefined;
    }

    const form = await ratioFormModel.create({
      recipe: weights,
      station,
      product: product.partNum,
      status,
      username: req.username,
    });

    if (form) {
      console.log(req.username + " successfully created a Ratio Form!");
      res.status(200).json({ form });
    } else {
      console.log("Something went wrong while creating Ratio Form!");
      res.sendStatus(500);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

module.exports = router;
