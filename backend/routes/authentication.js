const express = require("express");
const fetch = require("node-fetch");
const uuid = require("uuid");

const tokenModel = require("../models/tokenModel");

const router = express.Router();

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
    };

    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    const resp = await fetch("http://10.12.0.15:81/qac.php?login", {
      method: "POST",
      body: formBody,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
    });

    const data = await resp.json();
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
          username + " has succesfully sign in!",
        );
      } else {
        res.sendStatus(500);
        console.log(
          "\x1b[31m%s",
          "Something went wrong while creating token!",
          "\x1b[0m",
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
