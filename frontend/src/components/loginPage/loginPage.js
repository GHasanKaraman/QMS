import React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import { useSnackbar } from "notistack";

import logo from "../../images/logo.png";
import factory from "../../images/factory.gif";

import { userInformations } from "../../atoms/userAtom";
import { useRecoilState } from "recoil";

import "./login.css";
import axios from "../../api/axios";

const LoginPage = (props) => {
  const theme = useTheme();

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [user, setUser] = useRecoilState(userInformations);

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, []);

  const b64EncodeUnicode = (str) => {
    return btoa(
      encodeURIComponent(str).replace(
        /%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
          return String.fromCharCode("0x" + p1);
        }
      )
    );
  };

  const login = async (values) => {
    const { username, password } = values;

    const encoded = b64EncodeUnicode(username + "=" + password);
    await axios.addHeader(encoded);
    const res = await axios.post("/login", null);
    if (res?.data) {
      localStorage.setItem("token", res.data.token.token);
      axios.addToken(res.data.token.token);
      localStorage.setItem("username", res.data.token.userName);
      localStorage.setItem("access", res.data.token.access);
      setUser({
        username: res.data.token.userName,
        access: res.data.token.access,
      });

      navigate("/dashboard");
    } else {
      switch (res.response?.status) {
        case 404:
          enqueueSnackbar("Your username or password is incorrect!", {
            variant: "error",
          });
          break;

        case 500:
          enqueueSnackbar(
            "Something went wrong while authenticate the credentials!",
            {
              variant: "error",
            }
          );
          break;

        case 503:
          enqueueSnackbar("Something went wrong with the server!", {
            variant: "error",
          });
          break;
      }
    }
  };

  const handleSubmit = async (values, { resetForm }) => {
    login(values);
  };

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: yup.object().shape({
      username: yup.string().required("Please enter your username!"),
      password: yup.string().required("Please enter your password!"),
    }),
    onSubmit: handleSubmit,
  });

  return (
    <section>
      <img className="bg" src={factory} />
      <form className="login" onSubmit={formik.handleSubmit}>
        <img src={logo} />
        <div className="inputBox">
          <input
            type="text"
            placeholder="Username"
            name="username"
            value={formik.values.username}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
          />
          <span className="errorText">
            {formik.touched.username && formik.errors.username}
          </span>
        </div>
        <div className="inputBox">
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={formik.values.password}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
          />
          <span className="errorText">
            {formik.touched.password && formik.errors.password}
          </span>
        </div>
        <div className="inputBox">
          <input type="submit" value="Login" id="btn" />
        </div>
        <div className="group">
          <a href="#">Forget Password</a>
          <a href="#">Signup</a>
        </div>
      </form>
    </section>
  );
};

export default LoginPage;
