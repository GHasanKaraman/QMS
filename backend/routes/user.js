const express = require("express");

const router = express.Router();

router.post("/user/get", async (req, res) => {
  const loginUser = req.loginUser;
  const username = req.username;
  const access = req.access;
  try {
    if (username) {
      res.status(200).json({
        status: "success",
        loginUser: loginUser,
        username: username,
        access: access,
      });
      console.log("Retrieved user!");
    } else {
      res.sendStatus(500);
      console.log("\x1b[31m%s\x1b[0m", "Didn't retrieve user!");
    }
  } catch (e) {
    res.sendStatus(503);
    console.log(e);
  }
});

module.exports = router;
