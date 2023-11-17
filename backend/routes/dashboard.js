const express = require("express");
const router = express.Router();

router.use("/home", async (req, res) => {
  console.log("!!!");
  res.send({ a: 1 });
});

module.exports = router;
