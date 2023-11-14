import { Box } from "@mui/material";
import { useEffect } from "react";
import Header from "../Header";

const HomePage = (props) => {
  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

  return (
    <Box m="0 20px">
      <Header title="Home" subtitle="Welcome to Home Page"></Header>
    </Box>
  );
};

export default HomePage;
