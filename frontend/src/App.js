import { SnackbarProvider } from "notistack";
import Router from "./routes/router";
import ScrollToTop from "./components/scrollToTop";

function App() {
  return (
    <SnackbarProvider
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
    >
      <ScrollToTop />
      <Router />
    </SnackbarProvider>
  );
}

export default App;
