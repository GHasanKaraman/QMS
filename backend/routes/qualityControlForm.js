const express = require("express");
const router = express.Router();

router.post("/qualitycontrol", async (req, res) => {
  try {
    const resp = await fetch("http://10.12.0.15:81/qac.php?stations", {
      method: "GET",
    });

    const data = await resp.json();
    if (data) {
      res.status(200).json({ locations: data });
      console.log("Fetched all locations from OC DB!");
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

module.exports = router;
