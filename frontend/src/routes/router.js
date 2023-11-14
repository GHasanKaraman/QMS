import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

import Topbar from "../scenes/Topbar.jsx";
import Sidebar from "../scenes/Sidebar.jsx";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "../theme";

import LoginPage from "../components/loginPage/loginPage";
import HomePage from "../components/homePage/homePage.js";

import ViewLocationsPage from "../components/locationsPage/viewLocationsPage.js";
import AddLocationPage from "../components/locationsPage/addLocationPage";

const BarLayout = () => {
  const [theme, colorMode] = useMode();
  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          <Sidebar />
          <main className="content">
            <Topbar />
            <Outlet />
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

const RegularLayout = () => {
  const [theme, colorMode] = useMode();
  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          <main className="content">
            <Outlet />
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

const Router = () => {
  return (
    <Routes>
      <Route element={<RegularLayout />}>
        <Route
          exact
          path="/login"
          element={<LoginPage title="CiboQA | Login" />}
        />
      </Route>
      <Route element={<BarLayout />}>
        <Route
          exact
          path="/dashboard"
          element={<HomePage title="CiboQA | My Quality Dashboard" />}
        />
        <Route
          exact
          path="/locations/view"
          element={<ViewLocationsPage title="CiboENG | View Locations" />}
        />
        <Route
          exact
          path="/locations/add"
          element={<AddLocationPage title="CiboENG | Add Location" />}
        />
      </Route>
    </Routes>
  );
};

export default Router;
