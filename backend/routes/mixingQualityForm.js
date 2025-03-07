const express = require("express");
const fetch = require("node-fetch");
const sharp = require("sharp");
const mongoose = require("mongoose");
const router = express.Router();

const essentials = require("../utils/essentials");
const mixingQualityFormModel = require("../models/mixingQualityFormModel.js");
const upload = require("../file");
const imageModel = require("../models/imageModel");

router.post("/mixingquality/get", async (req, res) => {
  try {
    const { id } = req.body;
    const mixingQualityForm = await mixingQualityFormModel.aggregate([
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
    //   if (mixingQualityForm.length === 1) {
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
    const images = await imageModel.find({
      _id: { $in: mixingQualityForm[0].imageIDs },
    });

    if (images) {
      res.status(200).json({
        mixingQualityForm: mixingQualityForm[0],
        product: product,
        images,
      });
      console.log("Fetched " + id + " Mixing Quality form data sheet result!");
    } else {
      res.sendStatus(404);
    }
    /*} else {
      res.sendStatus(404);
    }*/
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

router.post("/mixingquality/add", upload.any(), async (req, res) => {
  try {
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
      const data = req.body;
      var status = undefined;
      if (
        data.correctLabel !== "No" &&
        data.probioticMixLot !== "No" &&
        data.allergensSeparate === "Yes" &&
        data.sensory === "Yes" &&
        data.cleanFloor === "Yes" &&
        data.areAllergensCorrect === "Yes" &&
        data.garbageOrganized === "Yes"
      ) {
        status = "passed";
      }

      const imageIDs = result.map((info) => info._id);
      const form = await mixingQualityFormModel.create({
        ...data,
        imageIDs,
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
