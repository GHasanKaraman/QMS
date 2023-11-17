import api from "axios";

const baseUrl = "http://10.12.11.88:4000";
//baseUrl = "http://localhost:4000"

const axios = {
  request: (method, path, params) => {
    return api({
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
    return axios.request("POST", path, params);
  },
  put: (path, params) => {
    return axios.request("PUT", path, params);
  },
  update: (path, params) => {
    return axios.request("UPDATE", path, params);
  },
  delete: (path, params) => {
    return axios.request("DELETE", path, params);
  },
  get: (path, params) => {
    return axios.request("GET", path, params);
  },
  addHeader: (data) => {
    api.defaults.headers.common["Authorization"] = "Header " + data;
  },
  addToken: (token) => {
    const sessiontoken = localStorage.getItem("token");
    api.defaults.headers.common["Authorization"] = token || sessiontoken;
  },
};
axios.addToken();
export default axios;
