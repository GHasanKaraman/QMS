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

const extractRange = (selectedCase) => {
  switch (selectedCase) {
    case "today":
      return {
        start: moment()
          .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
          .tz("America/New_York")
          .toDate(),
        end: moment()
          .add(1, "days")
          .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
          .tz("America/New_York")
          .toDate(),
      };
    case "week":
      return {
        start: moment().startOf("isoweek").tz("America/New_York").toDate(),
        end: moment().endOf("isoweek").tz("America/New_York").toDate(),
      };

    case "month":
      return {
        start: moment().startOf("month").tz("America/New_York").toDate(),
        end: moment().endOf("month").tz("America/New_York").toDate(),
      };

    case "quarter":
      return {
        start: moment().startOf("quarter").tz("America/New_York").toDate(),
        end: moment().endOf("quarter").tz("America/New_York").toDate(),
      };
    case "year":
      return {
        start: moment().startOf("year").tz("America/New_York").toDate(),
        end: moment().endOf("year").tz("America/New_York").toDate(),
      };
    default:
      return { start: undefined, end: undefined };
  }
};

module.exports = { getEST, fromNow, extractRange };
