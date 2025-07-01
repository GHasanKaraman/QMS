import { useState } from "react";
import { useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Collapse,
  Divider,
  Grid,
  IconButton,
  InputBase,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { useSnackbar } from "notistack";
import { useLocation, useNavigate } from "react-router-dom";

import Header from "../Header";
import { tokens } from "../../theme";
import axios from "../../api/axios";
import userAuth from "../../utils/userAuth";

import DateRangePicker, { useRangePicker } from "./dateRangePicker";

import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import SubjectIcon from "@mui/icons-material/Subject";
import Check from "@mui/icons-material/Check";

import loadingWhite from "../../images/loadingWhite.gif";
import loadingBlack from "../../images/loadingBlack.gif";
import GembaCard from "./GembaCard";

const ViewGEMBAPage = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const { enqueueSnackbar } = useSnackbar();

  const [forms, setForms] = useState([]);

  const [page, setPage] = useState({ value: queryParams.get("page") ?? 1 });
  const [count, setCount] = useState(1);

  const [loading, setLoading] = useState(true);

  const [selectedCase, setSelectedCase] = useState("today");
  const [searchText, setSearchText] = useState("");

  const [trigger, setTrigger] = useState({
    value: false,
  });
  const [getter, setter] = useRangePicker();

  const [openFiltersWindow, setOpenFiltersWindow] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const loadForms = async () => {
    try {
      const pageNumber = parseInt(page.value, 10);
      const res = await axios.get(
        `/gemba?page=${pageNumber}&show=${selectedCase}&startDate=${getter.startDate}&endDate=${getter.endDate}&searchText=${searchText}`
      );
      if (userAuth.control(res)) {
        setForms(Object.values(res.data.gemba));
        setCount(res.data.count);
        setLoading(false);
      } else {
        navigate("/login");
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        enqueueSnackbar("Please sign in again!", {
          variant: "error",
        });
      }
    } catch (error) {
      enqueueSnackbar("Something went wrong while authenticating the user!", {
        variant: "error",
      });
    }
  };

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

  useEffect(() => {
    loadForms();
  }, [page, selectedCase, trigger]);

  useEffect(() => {}, [searchText]);

  const handlePageChange = (_, value) => {
    setPage({ value });
    setLoading(true);
    navigate(`/gemba/view?page=${value}`);
  };

  return (
    <Box
      m="0 20px"
      sx={{
        "& .MuiInputBase-root::after": {
          borderBottomColor: colors.ciboInnerGreen[500],
        },
        "& .MuiInputBase-root::before": {
          borderBottomColor: colors.ciboInnerGreen[600],
        },
        "& .MuiFormLabel-root.Mui-focused": {
          color: colors.ciboInnerGreen[300],
        },
      }}
    >
      <Header title="GEMBA CARDS" subtitle="You can view the forms" />

      <Box py={2}>
        <Menu
          id="show-menu"
          open={openMenu}
          anchorEl={anchorEl}
          MenuListProps={{
            "aria-labelledby": "show-button",
          }}
          onClose={() => {
            setAnchorEl(null);
          }}
          slotProps={{
            paper: {
              sx: {
                "& .MuiMenuItem-root.MuiButtonBase-root": {
                  display: "flex",
                  justifyContent: "space-between",
                },
              },
            },
          }}
        >
          {[
            { label: "Today", key: "today" },
            { label: "This week", key: "week" },
            { label: "This month", key: "month" },
            { label: "This quarter", key: "quarter" },
            { label: "This year", key: "year" },
            { label: "All", key: "all" },
          ].map((item) => {
            return (
              <MenuItem
                key={item.key}
                onClick={() => {
                  setSelectedCase(item.key);

                  setOpenFiltersWindow(false);
                  setAnchorEl(null);

                  setSearchText("");
                  setter.setStartDate("");
                  setter.setEndDate("");
                }}
              >
                {selectedCase === item.key ? (
                  <ListItemIcon>
                    <Check />
                  </ListItemIcon>
                ) : null}

                <ListItemText>{item.label}</ListItemText>
              </MenuItem>
            );
          })}
        </Menu>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2}>
            <Paper
              component="form"
              sx={{
                backgroundColor: colors.primary[400],
                p: "2px 8px",
                display: "flex",
                alignItems: "center",
                width: "100%",
                borderRadius: "4px",
              }}
            >
              <IconButton
                id="show-button"
                type="button"
                aria-label="show"
                onClick={(event) => {
                  setAnchorEl(event.currentTarget);
                }}
                aria-controls={openMenu ? "show-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={openMenu ? "true" : undefined}
              >
                <SubjectIcon />
              </IconButton>
              <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder="Search"
                value={searchText}
                inputProps={{ "aria-label": "search gemba" }}
                onChange={(e) => {
                  if (e.target.value.trim() === "") {
                    setTrigger({ value: false });
                  }
                  setSearchText(e.target.value);
                }}
                onKeyPress={(e) => {
                  if (e.code === "Enter") {
                    e.preventDefault();
                    setTrigger({ value: true });
                  }
                }}
              />
              <IconButton
                aria-label="search"
                sx={{ p: "10px" }}
                onClick={() => {
                  setTrigger({ value: true });
                }}
              >
                <SearchIcon />
              </IconButton>
              <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
              <IconButton
                disabled={selectedCase === "special"}
                sx={{ p: "10px" }}
                aria-label="directions"
                onClick={() => {
                  setOpenFiltersWindow((open) => !open);
                }}
              >
                <FilterListIcon />
              </IconButton>
            </Paper>
          </Stack>
          <Collapse in={openFiltersWindow}>
            <Card variant="outlined" sx={{ background: colors.primary[400] }}>
              <CardHeader
                titleTypographyProps={{ variant: "h5" }}
                title="Filter options"
              />
              <CardContent>
                <Grid container spacing={4} justifyContent="center">
                  <Grid item xs={12} sm={6} lg={4}>
                    <DateRangePicker getter={getter} setter={setter} />
                  </Grid>
                </Grid>
              </CardContent>
              <CardActions>
                <Button
                  onClick={() => {
                    setTrigger({ value: true });
                  }}
                  size="small"
                  variant="contained"
                  type="button"
                  color="secondary"
                >
                  Filter
                </Button>
                <Button
                  onClick={() => {
                    setSearchText("");
                    setter.setStartDate("");
                    setter.setEndDate("");
                    setTrigger({ value: false });
                    setOpenFiltersWindow(false);
                  }}
                  variant="contained"
                  size="small"
                  type="reset"
                  color="error"
                >
                  Reset
                </Button>
              </CardActions>
            </Card>
          </Collapse>
        </Stack>
      </Box>

      {/* ========== GEMBA CARD GRIDS ========== */}
      {loading ? (
        <img
          alt="loadingGIF"
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            margin: "auto",
          }}
          src={theme.palette.mode === "light" ? loadingBlack : loadingWhite}
          width={350}
        />
      ) : (
        <Stack
          spacing={8}
          m="20px 0"
          justifyContent="center"
          alignItems="center"
          display="flex"
        >
          <Grid container spacing={3} justifyContent="center">
            {forms.map((item, index) => {
              return (
                <GembaCard
                  searchText={searchText}
                  index={index}
                  item={item}
                  condition={Boolean(forms)}
                />
              );
            })}
          </Grid>
          <Pagination
            size="large"
            page={page.value}
            color="secondary"
            onChange={handlePageChange}
            count={Math.ceil(count / 18)}
          />
        </Stack>
      )}
    </Box>
  );
};

export default ViewGEMBAPage;
