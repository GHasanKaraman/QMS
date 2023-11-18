const express = require("express");
const router = express.Router();

const tokenModel = require("../models/tokenModel");
const essentials = require("../utils/essentials");

function isEmpty(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) return false;
  }
  return true;
}

router.use(async (req, res, next) => {
  require("dns").resolve("www.google.com", function (err) {
    if (err) {
      const txt = String.raw`

                       ______
                    .-"      "-.
                   /            \
       _          |              |          _
      ( \         |,  .-.  .-.  ,|         / )
       > "=._     | )(__/  \__)( |     _.=" <
      (_/"=._"=._ |/     /\     \| _.="_.="\_)
             "=._ (_     ^^     _)"_.="
                 "=\__|IIIIII|__/="
                _.="| \IIIIII/ |"=._
      _     _.="_.="\          /"=._"=._     _
     ( \_.="_.="     '--------'     "=._"=._/ )
      > _.="                            "=._ <
     (_/                                    \_)
        
     `;
      console.log("\x1b[31m%s\x1b[0m", txt);
      console.log("\x1b[31m%s\x1b[0m", "NO INTERNET CONNECTION");
    }
  });
  try {
    const token = req.header("Authorization");
    if (token) {
      const tokenData = await tokenModel
        .find({ token: token })
        .sort({ createdAt: -1 })
        .limit(1);
      if (!isEmpty(tokenData)) {
        console.log("\x1b[35m%s\x1b[0m", token + " will be authenticated!");
        if (Math.abs(essentials.fromNow(tokenData[0].createdAt)) >= 60 * 24) {
          console.log(
            "\x1b[31m%s\x1b[0m",
            token + " has expired! User should sign in again!"
          );
          res.sendStatus(404);
        } else {
          req.username = tokenData[0].userName;
          console.log(
            "\x1b[32m%s\x1b[0m",
            tokenData[0].userName + " has been succesfully authenticated!"
          );
          next();
        }
      } else {
        console.log(
          "\x1b[31m%s\x1b[0m",
          "Token is not valid. User should sign in again!"
        );
        res.sendStatus(401);
      }
    } else {
      console.log(
        "\x1b[31m%s",
        "User is not authorized! User should sign in!",
        "\x1b[0m"
      );
      res.sendStatus(500);
    }
  } catch (e) {
    req.user = null;
    console.log(e);
    res.sendStatus(503);
  }
});

module.exports = router;
