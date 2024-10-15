const express = require("express");
const fetch = require("node-fetch");
const sharp = require("sharp");

const router = express.Router();
const upload = require("../file");

const essentials = require("../utils/essentials");
const imageModel = require("../models/imageModel");
const pgQualityControlModel = require("../models/pgQualityControlFormModel");

router.post("/pgqualitycontrol", async (req, res) => {
  try {
    const resp = await fetch("http://10.12.0.15:81/qac.php?stations", {
      method: "GET",
    });

    const data = await resp.json();
    if (data) {
      res.status(200).json({ stations: data });
      console.log("Fetched all locations from OC DB!");
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

const getShift = () => {
  const currentHour = new Date().getHours();
  if (currentHour > 7 && currentHour < 18) {
    return 1;
  }
  return 2;
};

router.post("/pgqualitycontrol/stationplan", async (req, res) => {
  try {
    const { station } = req.body;

    var details = {
      station: station,
      runDate: new Date().toLocaleDateString(),
      runShift: getShift(),
    };

    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");

    const resp = await fetch("http://10.12.0.15:81/qac.php?stationPlan", {
      method: "POST",
      body: formBody,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
    });
    const data = await resp.json();
    if (data) {
      res.status(200).json({ products: data });
      console.log("Fetched all products over " + station + " from OC DB!");
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

router.post("/pgqualitycontrol/getproduct", async (req, res) => {
  try {
    const { station, product } = req.body;

    var details = {
      station: station,
      prod: product,
    };

    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");

    const resp = await fetch("http://10.12.0.15:81/qac.php?getProduct", {
      method: "POST",
      body: formBody,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
    });
    const data = await resp.json();
    if (data) {
      res.status(200).json({ details: data });
      console.log(
        "Fetched all details over " +
          station +
          " and " +
          product +
          " from OC DB!",
      );
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});
router.post("/pgqualitycontrol/get", async (req, res) => {
  try {
    const { id } = req.body;
    const qualityControlForm = await pgQualityControlModel.find({ _id: id });
    if (qualityControlForm) {
      var details = {
        part: qualityControlForm[0].product,
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
      const images = await imageModel.find({
        _id: { $in: qualityControlForm[0].imageIDs },
      });
      if (images) {
        res.status(200).json({
          qualityControlForm: qualityControlForm[0],
          images: images,
          product: product,
        });
        console.log(
          "Fetched " + id + " quality control inspection data sheet result!",
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

router.post("/pgqualitycontrol/signoff", async (req, res) => {
  try {
    const { id } = req.body;
    if (req.access.includes("S")) {
      const qualityControlForm = await pgQualityControlModel.updateOne(
        { _id: id },
        { signedOff: req.username, signOffDate: essentials.getEST() },
      );
      if (qualityControlForm.modifiedCount == 1) {
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

router.post("/pgqualitycontrol/add", upload.any(), async (req, res) => {
  try {
    //Resizing the images and saving them
    await Promise.all(
      req.files.map(async (file) => {
        const filename = file.filename.replace(/\..+$/, "");
        const newFilename = `thumbnail-${filename}.jpeg`;
        await sharp(file.path)
          .rotate()
          .resize(200)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(`${file.destination}/${newFilename}`);
      }),
    );

    const imageDetails = req.files.map((file) => {
      let i = file.destination.lastIndexOf("/") + 1;
      return {
        folderIndex: file.destination.slice(i),
        fileName: file.filename,
      };
    });

    const result = await imageModel.insertMany(imageDetails);
    if (result) {
      const formInformations = req.body;
      var status = undefined;
      if (
        formInformations.isSealCorrectPouch === "Yes" &&
        formInformations.isNotchCorrect === "Yes" &&
        formInformations.metalDetector === "Yes" &&
        formInformations.isSealCorrectBox === "Yes" &&
        formInformations.areIngredientsCorrect === "Yes" &&
        formInformations.metalBallFeDetected !== "No" &&
        formInformations.metalBallNonFeDetected !== "No" &&
        formInformations.metalBallSsDetected !== "No"
      ) {
        status = "passed";
      }
      const imageIDs = result.map((info) => info._id);
      const form = await pgQualityControlModel.create({
        ...formInformations,
        imageIDs,
        username: req.username,
        status,
      });
      if (form) {
        console.log(
          req.username + " successfully created a P&G quality control form!",
        );
        res.status(200).json({ form });
      } else {
        console.log(
          "Something went wrong while creating a P&G quality control form!",
        );
        res.sendStatus(500);
      }
    } else {
      console.log("Image info has not been written in the database!");
      res.sendStatus(500);
    }
    console.log(result);
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

module.exports = router;
