export const toStringDate = (date, format) => {
  return new Date(date).toLocaleString("en-us", format);
};
