const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const moment = require("moment-timezone");

var morgan = require("morgan");
var fs = require("fs");
const chalk = require("chalk");

require("console-stamp")(console, {
  format: "(->).yellow :date().bold.black.bgRed",
});

require("dotenv").config();

const app = express();
mongoose.set("strictQuery", false);
mongoose.connect(
  "mongodb+srv://inventory:rNWsMsyxsVEXHFsw@cluster0.zjjva5g.mongodb.net/qms"
);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

db.once("open", function () {
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(cors());

  app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    console.log(username, password);

    res.status(400).json({ result: "success" });
  });

  var txt = encodeURIComponent(
    `
   _______ __          ____    ___ 
  / ____(_) /_  ____  / __ \\  /   |
 / /   / / __ \\/ __ \\/ / / / / /| |
/ /___/ / /_/ / /_/ / /_/ / / ___ |
\\____/_/_.___/\\____/\\___\\_\\/_/  |_|
                                   
  `
  );
  txt = decodeURIComponent(txt);
  console.log("\x1b[35m%s\x1b[0m", txt);

  app.listen(process.env.PORT, (req, res) => {
    console.log(
      "\x1b[33m%s\x1b[0m",
      "mongo connection established successfully!"
    );
    console.log("\x1b[34m%s\x1b[0m", "Listening on port " + process.env.PORT);
  });
});
