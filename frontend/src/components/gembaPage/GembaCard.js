import {
  ButtonBase,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Stack,
  Typography,
  useTheme,
  Zoom,
} from "@mui/material";

import Highlighter from "react-highlight-words";

import { useNavigate } from "react-router-dom";

import { tokens } from "../../theme";
import { toStringDate } from "../../utils/helpers";

import TaskAltIcon from "@mui/icons-material/TaskAlt";
import ErrorOutline from "@mui/icons-material/ErrorOutline";

const GembaCard = ({
  index,
  item,
  condition,
  searchText,
  searchMode = true,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const navigate = useNavigate();

  const getFormColor = (item) => {
    if (item.status === "passed") {
      return colors.ciboInnerGreen[500];
    } else {
      return colors.yoggieRed[500];
    }
  };

  return (
    <Grid key={index} item sm={8} md={4} lg={3} xl={2} textAlign={"center"}>
      <Zoom
        in={condition}
        style={{
          transitionDelay: (index / 3 + (index % 3)) * 75,
        }}
      >
        <ButtonBase
          onClick={() => {
            navigate(`/gemba/${item._id}`);
          }}
        >
          <Card
            sx={{
              minWidth: "240px",
              minHeight: 113,
              background: getFormColor(item),
              transition: "0.2s",
              "&:hover": {
                transform: "scale(1.05) !important",
                boxShadow: `0px 7px 40px ${getFormColor(item)}}`,
              },
            }}
          >
            <CardHeader
              avatar={
                item.status === "failed" ? <ErrorOutline /> : <TaskAltIcon />
              }
              title={
                <Typography
                  sx={{ justifySelf: "start" }}
                  variant="h4"
                  fontWeight="bold"
                >
                  {searchMode === true ? (
                    <Highlighter
                      searchWords={[searchText]}
                      autoEscape
                      textToHighlight={item.area}
                      highlightStyle={{
                        backgroundColor: "#ffc069",
                        padding: 0,
                      }}
                    />
                  ) : (
                    item.area
                  )}
                </Typography>
              }
              subheader={
                <Stack
                  direction="row"
                  spacing={3}
                  sx={{ color: colors.primary[400] }}
                >
                  <Typography variant="h7">
                    {toStringDate(item.createdAt, {
                      month: "short",
                      year: "numeric",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                    })}
                  </Typography>
                </Stack>
              }
              sx={{ color: colors.primary[400] }}
            />
            <CardContent>
              <Stack
                spacing={2}
                direction="column"
                textAlign={"center"}
                justifyContent={"space-between"}
              >
                <Typography variant="h5" sx={{ color: colors.primary[400] }}>
                  {searchMode === true ? (
                    <Highlighter
                      searchWords={[searchText]}
                      autoEscape
                      textToHighlight={item.username}
                      highlightStyle={{
                        backgroundColor: "#ffc069",
                        padding: 0,
                      }}
                    />
                  ) : (
                    item.username
                  )}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </ButtonBase>
      </Zoom>
    </Grid>
  );
};

export default GembaCard;
