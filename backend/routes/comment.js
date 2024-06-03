const express = require("express");
const sharp = require("sharp");

const commentModel = require("../models/commentModel");
const imageModel = require("../models/imageModel");

const upload = require("../file");
const mongoose = require("mongoose");
const router = express.Router();

router.post("/comment", async (req, res) => {
  try {
    const { formID, form } = req.body;
    const comments = await commentModel
      .aggregate([
        {
          $match: {
            $and: [
              { formID: new mongoose.Types.ObjectId(formID) },
              { form: form },
            ],
          },
        },
        {
          $lookup: {
            from: "images",
            localField: "imageID",
            foreignField: "_id",
            as: "image",
          },
        },
        { $unwind: { path: "$image", preserveNullAndEmptyArrays: true } },
      ])
      .sort({ createdAt: -1 });
    if (comments) {
      console.log(`All comments are fethced under ${formID}!`);
      res.status(200).json({ comments });
    } else {
      console.log(`Something went wrong finding the comments under ${formID}!`);
      res.sendStatus(500);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

router.post("/comment/add", upload.any(), async (req, res) => {
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
      const imageID = result[0]?._id;
      const username = req.username;
      const { formID, form, comment } = req.body;

      const commentRecord = await commentModel.create({
        imageID,
        username,
        formID,
        comment,
        form,
      });

      if (commentRecord) {
        console.log(req.username + ` left a comment on ${formID} ${form}.`);
        res.status(200).json({ commentRecord });
      } else {
        console.log(
          "Something went wrong while " +
            req.username +
            ` leaving a comment on ${formID} ${form}!`
        );
        res.sendStatus(500);
      }
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

module.exports = router;
