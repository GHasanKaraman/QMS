import { Routes, Route, Outlet } from "react-router-dom";

import Topbar from "../scenes/Topbar.jsx";
import Sidebar from "../scenes/Sidebar.jsx";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "../theme";

import LoginPage from "../components/loginPage/loginPage";
import DashboardPage from "../components/dashboardPage/dashboardPage.js";
import RatioFormPage from "../components/ratioFormPage/ratioFormPage.js";
import QualityControlPage from "../components/qualityControlPage/qualityControlPage.js";
import ViewQualityControlPage from "../components/qualityControlPage/viewQualityControlPage.js";

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
          element={<DashboardPage title="CiboQA | Dashboard" />}
        />

        <Route
          exact
          path="/qualitycontrol"
          element={
            <QualityControlPage title="CiboQA | Quality Control Inspection" />
          }
        />
        <Route
          exact
          path="/qualitycontrol/:id"
          element={
            <ViewQualityControlPage title="CiboQA | Data Sheet Results" />
          }
        />

        <Route
          exact
          path="/ratioform"
          element={
            <RatioFormPage title="CiboQA | Finished Product Ratio Form" />
          }
        />
      </Route>
    </Routes>
  );
};

export default Router;
