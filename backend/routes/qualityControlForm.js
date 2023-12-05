const express = require("express");
const router = express.Router();

router.post("/qualitycontrol", async (req, res) => {
  try {
    const resp = await fetch("http://10.12.0.15:81/qac.php?stations", {
      method: "GET",
    });

    const data = await resp.json();
    if (data) {
      res.status(200).json({ stations: data });
      console.log("Fetched all locations from OC DB!");
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

const getShift = () => {
  const currentHour = new Date().getHours();
  if (currentHour > 7 && currentHour < 18) {
    return 1;
  }
  return 2;
};

router.post("/qualitycontrol/stationplan", async (req, res) => {
  try {
    const { station } = req.body;

    var details = {
      station: station,
      runDate: new Date().toLocaleDateString(),
      runShift: getShift(),
    };

    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");

    const resp = await fetch("http://10.12.0.15:81/qac.php?stationPlan", {
      method: "POST",
      body: formBody,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
    });
    const data = await resp.json();
    if (data) {
      res.status(200).json({ products: data });
      console.log("Fetched all products over " + station + " from OC DB!");
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

router.post("/qualitycontrol/getproduct", async (req, res) => {
  try {
    const { station, product } = req.body;

    var details = {
      station: station,
      prod: product,
    };

    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");

    const resp = await fetch("http://10.12.0.15:81/qac.php?getProduct", {
      method: "POST",
      body: formBody,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
    });
    const data = await resp.json();
    if (data) {
      res.status(200).json({ details: data });
      console.log(
        "Fetched all details over " +
          station +
          " and " +
          product +
          " from OC DB!"
      );
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

module.exports = router;
