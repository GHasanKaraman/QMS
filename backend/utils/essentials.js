const moment = require("moment-timezone");

const getEST = () => {
  const date = Date.now();
  return moment(date).tz("America/New_York").format();
};
