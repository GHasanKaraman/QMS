import React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import { useSnackbar } from "notistack";

import logo from "../../images/logo.png";
import factory from "../../images/factory.gif";

import "./login.css";

const LoginPage = (props) => {
  const theme = useTheme();

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

  useEffect(() => {}, []);

  const login = async (values) => {
    if (values.remember) {
      localStorage.setItem("username", values.username);
      localStorage.setItem("remember", true);
    } else {
      localStorage.removeItem("username");
      localStorage.removeItem("remember");
    }

    //const res = await userAuth.login(values.username, values.password);

    const res = {};
    if (res.result === "success") {
      navigate("/dashboard");
    } else if (res.result === "not_found") {
      enqueueSnackbar("Your username or password is incorrect!", {
        variant: "error",
      });
    } else {
      enqueueSnackbar("You are not authenticated!", {
        variant: "error",
      });
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
