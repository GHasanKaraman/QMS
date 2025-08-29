const express = require("express");
const uuid = require("uuid");

const tokenModel = require("../models/tokenModel");

const router = express.Router();
const { sendQAC } = require("../qac.js");

router.post("/login", async (req, res) => {
  const encoded = req.header("Authorization");
  const credential = encoded.split(" ")[1];
  const decodedCredential = Buffer.from(credential, "base64").toString();
  const [username, password] = decodedCredential.split("=");
  try {
    console.log("\x1b[36m%s", username, "attempt to sign in!", "\x1b[0m");

    var details = {
      u: username,
      p: password,
      ip: req.ip,
    };

    const data = await sendQAC("login", details);

    if (data.login === 1) {
      const token = await tokenModel.create({
        token: uuid.v4(),
        loginUser: username,
        userName: data.userName,
        access: data.access,
      });

      if (token) {
        res.status(200).json({ token: token });
        console.log(
          "\x1b[32m%s\x1b[0m",
          username + " has succesfully sign in!"
        );
      } else {
        res.sendStatus(500);
        console.log(
          "\x1b[31m%s",
          "Something went wrong while creating token!",
          "\x1b[0m"
        );
      }
    } else {
      console.log("\x1b[31m%s", username, "is not in the database!", "\x1b[0m");
      res.sendStatus(404);
    }
  } catch (e) {
    res.sendStatus(503);
    console.log(e);
  }
});

module.exports = router;
