const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

var morgan = require("morgan");
const chalk = require("chalk");

const authentication = require("./routes/authentication.js");
const authorization = require("./routes/authorization.js");
const user = require("./routes/user.js");
const dashboard = require("./routes/dashboard.js");
const rundashboard = require("./routes/runDashboard.js");
const runsignoff = require("./routes/runSignoff.js");
const runsummary = require("./routes/runSummary.js");
const signoff = require("./routes/signoff.js");
const qualityControlForm = require("./routes/qualityControlForm.js");
const pgqualitycontrol = require("./routes/pgQualityControlForm.js");
const metalDetectorForm = require("./routes/metalDetectorForm.js");
const xRayForm = require("./routes/xRayForm.js");
const labelInspectionForm = require("./routes/labelInspectionForm.js");
const ratioForm = require("./routes/ratioForm.js");
const lotInspectionForm = require("./routes/lotInspectionForm.js");
const preOperationalForm = require("./routes/preOperationalForm.js");
const mixingQualityForm = require("./routes/mixingQualityForm.js");
const roastingQualityForm = require("./routes/roastingQualityForm.js");
const comment = require("./routes/comment.js");

require("console-stamp")(console, {
  format: "(->).yellow :date().bold.black.bgRed",
});

require("dotenv").config();

const app = express();
mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGO_TEST);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

db.once("open", function () {
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(cors());

  app.use((req, res, next) => {
    if ("OPTIONS" === req.method) {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  app.use("/imgs", express.static(__dirname + "/imgs"));
  app.use("/utils", express.static(__dirname + "/utils"));

  app.get("/", async (req, res) => {
    //res.send("<h2 style = color:green>Listening port...</h2>");
    res.send(
      "<div style='width:100%;text-align:center'><img width='50%' src='/utils/logo.png'/><h1 style = color:green>Server is running...</h1></div>",
    );
  });

  app.use("/", authentication);
  app.use("/", authorization);
  app.use("/", user);

  app.use("/", user);
  app.use("/", dashboard);
  app.use("/", rundashboard);
  app.use("/", runsignoff);
  app.use("/", runsummary);
  app.use("/", signoff);

  app.use("/", preOperationalForm);
  app.use("/", qualityControlForm);
  app.use("/", mixingQualityForm);
  app.use("/", roastingQualityForm);
  app.use("/", pgqualitycontrol);
  app.use("/", metalDetectorForm);
  app.use("/", xRayForm);
  app.use("/", labelInspectionForm);
  app.use("/", lotInspectionForm);
  app.use("/", ratioForm);
  app.use("/", comment);

  var txt = encodeURIComponent(
    `
   _______ __          ____    ___ 
  / ____(_) /_  ____  / __ \\  /   |
 / /   / / __ \\/ __ \\/ / / / / /| |
/ /___/ / /_/ / /_/ / /_/ / / ___ |
\\____/_/_.___/\\____/\\___\\_\\/_/  |_|
                                   
  `,
  );
  txt = decodeURIComponent(txt);
  console.log("\x1b[35m%s\x1b[0m", txt);

  app.listen(process.env.PORT, (req, res) => {
    console.log(
      "\x1b[33m%s\x1b[0m",
      "mongo connection established successfully!",
    );
    console.log("\x1b[34m%s\x1b[0m", "Listening on port " + process.env.PORT);
  });
});
