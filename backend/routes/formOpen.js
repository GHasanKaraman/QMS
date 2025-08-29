const express = require("express");
const router = express.Router();

const { sendQAC } = require("../qac.js");

router.post("/formOpen", async (req, res) => {
  try {
    sendQAC("formOpen", { ...req.body, ip: req.ip });
    res.status(200);
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

module.exports = router;
