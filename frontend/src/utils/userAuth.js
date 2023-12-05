import axios from "../api/axios";

const userAuth = {
  control: (res) => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.addToken(token);
      if (res) {
        if (res?.data) {
          return true;
        } else if (res?.response?.data?.error === "token") {
          localStorage.removeItem("token");
          return false;
        } else {
          return true;
        }
      } else {
        return true;
      }
    } else {
      return false;
    }
  },
};

export default userAuth;
