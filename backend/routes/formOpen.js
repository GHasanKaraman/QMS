const express = require("express");
const router = express.Router();

const { sendQAC } = require("../qac.js");

router.post("/formOpen", async (req, res) => {
  try {
    await sendQAC("formOpen", {
      ...req.body,
      ip: req.ip,
      username: req.username,
    });
    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

module.exports = router;
