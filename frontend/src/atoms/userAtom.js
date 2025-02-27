import { atom, selector } from "recoil";

export const userInformations = atom({
  key: "userInformations",
  default: {
    loginUser: "",
    username: "",
    access: "",
  },
});

export const userInfoParams = selector({
  key: "userInfo",
  get: ({ get }) => {
    const userInfo = get(userInformations);
    return userInfo;
  },
});
