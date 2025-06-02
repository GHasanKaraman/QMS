import { Routes, Route, Outlet, Navigate } from "react-router-dom";

import Topbar from "../scenes/Topbar.jsx";
import Sidebar from "../scenes/Sidebar.jsx";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "../theme";

import LoginPage from "../components/loginPage/loginPage";
import DashboardPage from "../components/dashboardPage/dashboardPage.js";
import RatioFormPage from "../components/ratioFormPage/ratioFormPage.js";
import QualityControlPage from "../components/qualityControlPage/qualityControlPage.js";
import ViewQualityControlPage from "../components/qualityControlPage/viewQualityControlPage.js";
import DirectObservationMetalDetectorPage from "../components/directObservationMetalDetectorPage/directObservationMetalDetectorPage.js";
import ViewDirectObservationMetalDetectorPage from "../components/directObservationMetalDetectorPage/viewDirectObservationMetalDetectorPage.js";
import DirectObservationLabelInspectionPage from "../components/directObservationLabelInspectionPage copy/directObservationLabelInspectionPage.js";
import ViewDirectObservationLabelInspectionPage from "../components/directObservationLabelInspectionPage copy/viewDirectObservationLabelInspectionPage.js";
import PGQualityControlPage from "../components/pgQualityControlPage/pgQualityControlPage.js";
import ViewPGQualityControlPage from "../components/pgQualityControlPage/viewPGQualityControlPage.js";
import SignOffPanelPage from "../components/signoffPanelPage/signoffPanelPage.js";
import LotInspectionPage from "../components/lotInspectionPage/lotInspectionPage.js";
import ViewLotInspectionPage from "../components/lotInspectionPage/viewLotInspectionPage.js";
import PreOperationalPage from "../components/preOperationalPage/preOperationalPage.js";
import ViewPreOperationalPage from "../components/preOperationalPage/viewPreOperationalPage.js";
import DirectObservationXRayPage from "../components/directObservationXRayPage/directObservationXRayPage.js";
import ViewDirectObservationXRayPage from "../components/directObservationXRayPage/viewDirectObservationXRayPage.js";
import MixingQualityControlPage from "../components/mixingQualityControlPage/mixingQualityControlPage.js";
import ViewMixingQualityControlPage from "../components/mixingQualityControlPage/viewMixingQualityControlPage.js";
import RoastingQualityControlPage from "../components/roastingQualityControlPage/roastingQualityControlPage.js";
import ViewRoastingQualityControlPage from "../components/roastingQualityControlPage/viewRoastingQualityControlPage.js";
import RunDashboardPage from "../components/runDashboardPage/runDashboardPage.js";
import RunSignoffPage from "../components/runSignoffPage/runSignoffPage.js";
import RunSummaryPage from "../components/runSummaryPage/runSummaryPage.js";
import SignoffDashboard from "../components/signoffPanelPage/signoffDashboard.js";
import SignoffSteps from "../components/signoffPanelPage/signoffSteps.js";
import CCPPage from "../components/ccpPage/ccpPage.js";
import ViewCCPPage from "../components/ccpPage/viewCcpPage.js";
import ViewRatioFormPage from "../components/ratioFormPage/viewRatioFormPage.js";
import AddGEMBAPage from "../components/gembaPage/addGembaPage.js";
import ViewGEMBAPage from "../components/gembaPage/viewGembaPage.js";
import GEMBAReportPage from "../components/gembaPage/gembaReport.js";

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
        <Route exact path="/" element={<LoginPage title="CiboQA | Login" />} />
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
          path="/gemba/add"
          element={<AddGEMBAPage title="CiboQA | GEMBA Control" />}
        />
        <Route
          exact
          path="/gemba/view"
          element={<ViewGEMBAPage title="CiboQA | GEMBA Cards" />}
        />
        <Route
          exact
          path="/gemba/:id"
          element={<GEMBAReportPage title="CiboQA | GEMBA Report" />}
        />

        <Route
          exact
          path="/runqualitydashboard/:id"
          element={<RunDashboardPage title="CiboQA | Run Quality Dashboard" />}
        />
        <Route
          exact
          path="/runsignoff/:id"
          element={<RunSignoffPage title="CiboQA | Run Sign Off" />}
        />
        <Route
          exact
          path="/runsummary/:id"
          element={<RunSummaryPage title="CiboQA | Run Summary" />}
        />

        <Route
          exact
          path="/signoff"
          element={<SignOffPanelPage title="CiboQA | Sign Off Dashboard" />}
        />
        <Route
          exact
          path="/signoff/:id"
          element={<SignoffDashboard title="CiboQA | Sign Off Dashboard" />}
        />
        <Route
          exact
          path="/signoffsteps"
          element={<SignoffSteps title="CiboQA | Run Signoff" />}
        />

        <Route
          exact
          path="/preoperational"
          element={
            <PreOperationalPage title="CiboQA | Pre-Operational Inspection" />
          }
        />
        <Route
          exact
          path="/preoperational/:id"
          element={
            <ViewPreOperationalPage title="CiboQA | Data Sheet Results" />
          }
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
          path="/mixingquality"
          element={
            <MixingQualityControlPage title="CiboQA | Mixing Quality Control Inspection" />
          }
        />
        <Route
          exact
          path="/mixingquality/:id"
          element={
            <ViewMixingQualityControlPage title="CiboQA | Data Sheet Results" />
          }
        />

        <Route
          exact
          path="/roastingquality"
          element={
            <RoastingQualityControlPage title="CiboQA | Roasting Quality Control Inspection" />
          }
        />
        <Route
          exact
          path="/roastingquality/:id"
          element={
            <ViewRoastingQualityControlPage title="CiboQA | Data Sheet Results" />
          }
        />

        <Route
          exact
          path="/ccp"
          element={<CCPPage title="CiboQA | Parameters Inspection Form" />}
        />
        <Route
          exact
          path="/ccp/:id"
          element={<ViewCCPPage title="CiboQA | Data Sheet Results" />}
        />

        <Route
          exact
          path="/lotinspection"
          element={<LotInspectionPage title="CiboQA | LOT Inspection" />}
        />
        <Route
          exact
          path="/lotinspection/:id"
          element={
            <ViewLotInspectionPage title="CiboQA | Data Sheet Results" />
          }
        />

        <Route
          exact
          path="/pgqualitycontrol"
          element={
            <PGQualityControlPage title="CiboQA | P&G Quality Control Inspection" />
          }
        />
        <Route
          exact
          path="/pgqualitycontrol/:id"
          element={
            <ViewPGQualityControlPage title="CiboQA | Data Sheet Results" />
          }
        />

        <Route
          exact
          path="/metaldetector"
          element={
            <DirectObservationMetalDetectorPage title="CiboQA | Metal Detector Inspection" />
          }
        />
        <Route
          exact
          path="/metaldetector/:id"
          element={
            <ViewDirectObservationMetalDetectorPage title="CiboQA | Data Sheet Results" />
          }
        />

        <Route
          exact
          path="/xray"
          element={
            <DirectObservationXRayPage title="CiboQA | X-Ray Inspection" />
          }
        />
        <Route
          exact
          path="/xray/:id"
          element={
            <ViewDirectObservationXRayPage title="CiboQA | Data Sheet Results" />
          }
        />

        <Route
          exact
          path="/labelinspection"
          element={
            <DirectObservationLabelInspectionPage title="CiboQA | Label Inspection" />
          }
        />
        <Route
          exact
          path="/labelinspection/:id"
          element={
            <ViewDirectObservationLabelInspectionPage title="CiboQA | Data Sheet Results" />
          }
        />

        <Route
          exact
          path="/ratio"
          element={
            <RatioFormPage title="CiboQA | Finished Product Ratio Form" />
          }
        />
        <Route
          exact
          path="/ratio/:id"
          element={<ViewRatioFormPage title="CiboQA | Data Sheet Results" />}
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
};

export default Router;
