import axios from "axios";

const baseUrl = "http://localhost:4000";
//baseUrl = "http://localhost:4000"

const baseRequest = {
  request: (method, path, params) => {
    return axios({
      method,
      url: baseUrl + path,
      data: params,
    })
      .then((result) => {
        return result;
      })
      .catch((error) => {
        return error;
      });
  },
  multiPartPost: (path, form) => {
    return axios.post(baseUrl + path, form, {
      headers: {
        "content-type": "multipart/form-data;",
      },
    });
  },
  post: (path, params) => {
    return baseRequest.request("POST", path, params);
  },
  put: (path, params) => {
    return baseRequest.request("PUT", path, params);
  },
  update: (path, params) => {
    return baseRequest.request("UPDATE", path, params);
  },
  delete: (path, params) => {
    return baseRequest.request("DELETE", path, params);
  },
  get: (path, params) => {
    return baseRequest.request("GET", path, params);
  },
  addHeader: (data) => {
    axios.defaults.headers.common["Authorization"] = "Header " + data;
  },
  addToken: (token) => {
    const sessiontoken = localStorage.getItem("token");
    axios.defaults.headers.common["Authorization"] = token || sessiontoken;
  },
};
baseRequest.addToken();
export default baseRequest;
