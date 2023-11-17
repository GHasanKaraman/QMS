import axios from "../api/axios";

const userAuth = {
  control: (res) => {
    const token = localStorage.getItem("token");
    axios.addToken(token);
    if (res?.data) {
      return true;
    }
    return false;
  },
};

export default userAuth;
