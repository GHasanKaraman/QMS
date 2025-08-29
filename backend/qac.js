const fetch = require("node-fetch");

const baseUrl = "http://10.12.0.15:81/qac.php?";

const sendQAC = async (
  path,
  details,
  method = "POST",
  headers = {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
  }
) => {
  const reqUrl = baseUrl + path;
  var formBody = [];
  for (var property in details) {
    var encodedKey = encodeURIComponent(property);
    var encodedValue = encodeURIComponent(details[property]);
    formBody.push(encodedKey + "=" + encodedValue);
  }
  formBody = formBody.join("&");

  const resp = await fetch(reqUrl, {
    method: method,
    body: formBody,
    headers: headers,
  });

  const data = await resp.json();

  return data;
};

module.exports = { sendQAC };
