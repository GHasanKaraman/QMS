const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();

const ratioFormModel = require("../models/ratioFormModel");

router.post("/ratioform", async (req, res) => {
  try {
    const resp = await fetch("http://10.12.0.15:81/qac.php?stations", {
      method: "GET",
    });

    const data = await resp.json();
    if (data) {
      res.status(200).json({ locations: data });
      console.log("Fetched all locations from OC DB!");
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});
router.post("/ratioform/recipe", async (req, res) => {
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

router.put("/ratioform/save", async (req, res) => {
  try {
    const values = req.body;
    if (values) {
      const ratioForm = await ratioFormModel.create({
        ...values,
        username: req.username,
      });
      if (ratioForm) {
        res.sendStatus(200);
        console.log(
          "\x1b[32m%s\x1b[0m",
          req.username + " has succesfully created a ratio form!"
        );
      } else {
        res.sendStatus(500);
        console.log(
          "\x1b[31m%s",
          "Something went wrong while creating a ratio form!",
          "\x1b[0m"
        );
      }
    } else {
      console.log(
        "\x1b[31m%s",
        "Server didn't get the ratio form values!",
        "\x1b[0m"
      );
      res.sendStatus(500);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

module.exports = router;
