const express = require("express");
const fetch = require("node-fetch");
const sharp = require("sharp");

const router = express.Router();
const upload = require("../file");

const essentials = require("../utils/essentials");
const imageModel = require("../models/imageModel");
const lotInspectionFormModel = require("../models/lotInspectionFormModel");

router.post("/lotinspection/get", async (req, res) => {
  try {
    const { id } = req.body;
    const lotInspectionForm = await lotInspectionFormModel.find({ _id: id });
    if (lotInspectionForm) {
      var details = {
        part: lotInspectionForm[0].product,
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
        _id: { $in: lotInspectionForm[0].imageIDs },
      });
      if (images) {
        res.status(200).json({
          lotInspectionForm: lotInspectionForm[0],
          images: images,
          product: product,
        });
        console.log(
          "Fetched " + id + " quality control inspection data sheet result!"
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

router.post("/lotinspection/signoff", async (req, res) => {
  try {
    const { id } = req.body;
    if (req.access.includes("S")) {
      const lotInspectionForm = await lotInspectionFormModel.updateOne(
        { _id: id },
        { signedOff: req.username, signOffDate: essentials.getEST() }
      );
      if (lotInspectionForm.modifiedCount == 1) {
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

router.post("/lotinspection/add", upload.any(), async (req, res) => {
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
      })
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
      if (formInformations.itemCode1 && formInformations.lotCode1) {
        status = "passed";
      }
      const imageIDs = result.map((info) => info._id);
      const form = await lotInspectionFormModel.create({
        ...formInformations,
        imageIDs,
        username: req.username,
        status,
      });
      if (form) {
        console.log(
          req.username + " successfully created a lot inspection form!"
        );
        res.status(200).json({ form });
      } else {
        console.log("Something went wrong while creating lot inspection form!");
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
