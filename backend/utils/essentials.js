const moment = require("moment-timezone");

const getEST = () => {
  const date = Date.now();
  return moment(date).tz("America/New_York").format();
};

const fromNow = (date) => {
  return moment(Date.now())
    .tz("America/New_York")
    .diff(moment(date).tz("America/New_York"), "minutes");
};

module.exports = { getEST, fromNow };
