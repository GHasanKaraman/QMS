import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { GridRowModes, DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useTheme,
} from "@mui/material";
import { useSnackbar } from "notistack";
import useMediaQuery from "@mui/material/useMediaQuery";

import Header from "../Header";

import { tokens } from "../../theme";

import axios from "../../api/axios";

const ViewLocationsPage = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [rowModesModel, setRowModesModel] = useState({});

  const [data, setData] = useState([]);

  const [openDialog, setOpenDialog] = useState(false);

  const [id, setID] = useState();

  const [searchText, setSearchText] = useState("");
  const [rows, setRows] = useState([]);

  const [racks, setRacks] = useState([]);

  const loadLocations = async (response) => {};

  const loadRacks = async (response) => {};

  const loadLocationsPage = async () => {};

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

  useEffect(() => {}, []);

  const columns = [
    {
      field: "location",
      headerName: "Location",
      flex: 1,
      cellClassName: "name-column--cell",
      editable: true,
    },
    {
      field: "rack",
      headerName: "Rack",
      flex: 1,
      cellClassName: "name-column--cell",
      editable: true,
      type: "singleSelect",
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      flex: 0.4,
      getActions: (params) => {
        const { row, id } = params;
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={
              <EditIcon
                sx={{
                  padding: "3px",
                  background: colors.ciboInnerGreen[400],
                  borderRadius: 1,
                  color: colors.primary[400],
                  fontSize: "25px",
                }}
              />
            }
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={
              <DeleteIcon
                sx={{
                  padding: "2px",
                  background: colors.yoggieRed[500],
                  borderRadius: 1,
                  color: colors.primary[400],
                  fontSize: "25px",
                }}
              />
            }
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id) => async () => {
    setOpenDialog(true);
    setID(id);
  };

  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });
  };

  const processRowUpdate = useCallback(async (row, old) => {
    const res = null;
    if (res.data.status === "success") {
      enqueueSnackbar("Location has been successfully updated!", {
        variant: "success",
      });
      await loadLocationsPage();
      let { location, rack } = row;
      return { ...row, location: location.toUpperCase(), rack };
    } else if (res.data.status === "failed") {
      enqueueSnackbar("Something went wrong while updating the location!", {
        variant: "error",
      });
    } else {
      enqueueSnackbar("Server didn't get the request properly!", {
        variant: "error",
      });
    }
    return { ...old };
  }, []);

  const onProcessRowUpdateError = useCallback((err) => {
    console.log(err);
  }, []);

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  return (
    <Box m="0 20px ">
      <Dialog
        fullScreen={fullScreen}
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm the action"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Do you really want to delete this location?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="info"
            onClick={() => {
              setOpenDialog(false);
            }}
          >
            Disagree
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={async () => {
              const res = null;
              if (res.data.status === "success") {
                enqueueSnackbar("Location has been successfully deleted!", {
                  variant: "success",
                });
                await loadLocationsPage();
              } else if (res.data.status === "failed") {
                enqueueSnackbar(
                  "Something went wrong while deleting the location!",
                  {
                    variant: "error",
                  }
                );
              } else {
                enqueueSnackbar("Server didn't get the request properly!", {
                  variant: "error",
                });
              }
              setOpenDialog(false);
            }}
            autoFocus
          >
            Agree
          </Button>
        </DialogActions>
      </Dialog>
      <Header title="VIEW LOCATIONS" subtitle="Managing the Locations" />
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.ciboInnerGreen[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.ciboInnerGreen[500],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.ciboInnerGreen[500],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.ciboInnerGreen[200]} !important`,
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
          "& .MuiDataGrid-cell:focus": {
            outlineColor: colors.primary[400],
          },
          "& .MuiDataGrid-cell:focus-within": {
            outlineColor: colors.primary[400],
          } /*,
                    "& .MuiDataGrid-row--editing .MuiDataGrid-cell--editing": {
                      backgroundColor: "red",
                    }*/,
          "& .MuiInputBase-root::after": {
            borderBottomColor: colors.ciboInnerGreen[500],
          },
          "& .MuiInputBase-root::before": {
            borderBottomColor: colors.ciboInnerGreen[600],
          },
        }}
      >
        <DataGrid
          disableRowSelectionOnClick={true}
          rows={rows}
          columns={columns}
          slotProps={{
            toolbar: {
              value: searchText,
              onChange: (event) => {},
              clearSearch: () => {},
            },
          }}
          getRowId={(row) => row._id}
          editMode="row"
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={onProcessRowUpdateError}
        />
      </Box>
    </Box>
  );
};

export default ViewLocationsPage;
