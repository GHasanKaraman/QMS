import axios from "../api/axios";

const saveRatioForm = async (values, type) => {
  const res = await axios.put("/ratioform/save", { type, ...values });
  return res;
};

export { saveRatioForm };
