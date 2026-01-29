import React, { useEffect, useState } from "react";
import { Box, Typography, Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Tab, TablePagination } from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import { useGetUsersQuery } from "../../slices/member/usersApiSlice";
import {
  useGetEquipmentQuery,
  useCreateEquipmentMutation,
  useUpdateEquipmentMutation,
  useDeleteEquipmentMutation,
} from "../../slices/equipment/equipmentApiSlice";
import Notification from "../../components/Basic/Notification";
import { useSelector } from "react-redux";

const emptyForm = {
  title: "",
  brand: "",
  property: "",
  number: "",
  status: "",
  user: "",
};

const EquipmentScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState(emptyForm);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [userFilter, setUserFilter] = useState("");
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data: equipmentRes } = useGetEquipmentQuery();
  const equipments = (equipmentRes?.data || [])
    .filter((item) =>
      userFilter ? item.user?._id === userFilter : true
    )
    .filter((item) =>
      search
        ? `${item.title} ${item.brand} ${item.serial_number}`
          .toLowerCase()
          .includes(search.toLowerCase())
        : true
    );

  const { data: usersRes } = useGetUsersQuery();
  const users = usersRes || [];

  useEffect(() => {
    setPage(0);
  }, [userFilter, search]);


  const [createEquipment] = useCreateEquipmentMutation();
  const [updateEquipment] = useUpdateEquipmentMutation();
  const [deleteEquipment] = useDeleteEquipmentMutation();

  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success", // success | error | warning | info
  });

  const showNotification = (message, severity = "success") => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddClick = () => {
    setSelectedEquipment(null);
    setFormData(emptyForm);
    setFormVisible(true);
  };

  const handleEditClick = (item) => {
    setSelectedEquipment(item);
    setFormData({
      id: item._id,
      title: item.title,
      brand: item.brand,
      property: item.property,
      number: item.number,
      status: item.status || "",
      user: item.user?._id || "",
    });
    setFormVisible(true);
  };

  const handleCancel = () => {
    setFormVisible(false);
    setSelectedEquipment(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedEquipment) {
        await updateEquipment(formData).unwrap();
        showNotification("Equipment updated successfully!", "success");
      } else {
        await createEquipment(formData).unwrap();
        showNotification("Equipment created successfully!", "success");
      }

      setFormVisible(false);
      setSelectedEquipment(null);
      setFormData(emptyForm);
    } catch (err) {
      showNotification(err?.data?.message || err.error, "error");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    await deleteEquipment(deleteId).unwrap();
    showNotification("Equipment deleted successfully!");
    setDeleteId(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // reset to first page
  };

  const paginatedEquipment = equipments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box className="mx-3 my-5" style={{ width: "calc(100vw-240px)" }}>
      <Typography variant="h4" gutterBottom>
        Equipments
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        onClick={handleAddClick}
      >
        <Add /> Add Equipment
      </Button>
      <TextField
        size="small"
        label="Search"
        placeholder="Title, Brand, Serial..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ ml: 2 }}
      />
      <FormControl size="small" sx={{ minWidth: 200, ml: 2 }}>
        <InputLabel>User Filter</InputLabel>
        <Select
          label="User Filter"
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
        >
          <MenuItem value="">
            <em>All Users</em>
          </MenuItem>
          {users.map((u) => (
            <MenuItem key={u._id} value={u._id}>
              {u.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {formVisible && (
        <div className="equipment-table mt-3">
          <Typography variant="h6">{selectedEquipment ? "Update Equipment" : "Add New Equipment"}</Typography>
          <form onSubmit={handleSubmit} noValidate>
            <Box sx={{ display: "flex", gap: 2, flexDirection: "row", mb: 2, mt: 1 }}>
              <TextField
                label="Title"
                variant="outlined"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                sx={{ flex: 1 }}
              />
              <TextField
                label="Brand"
                variant="outlined"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                required
                sx={{ flex: 1 }}
              />
              <TextField
                label="Property"
                variant="outlined"
                name="property"
                value={formData.property}
                onChange={handleChange}
                required
                sx={{ flex: 1 }}
              />
              <TextField
                label="Number"
                variant="outlined"
                name="number"
                value={formData.number}
                onChange={handleChange}
                required
                sx={{ flex: 1 }}
              />
              <TextField
                label="Status"
                variant="outlined"
                name="status"
                value={formData.status}
                onChange={handleChange}
                sx={{ flex: 1 }}
              />
              <FormControl fullWidth sx={{ flex: 1 }}>
                <InputLabel id="user-select-label">Select Users</InputLabel>
                <Select
                  labelId="user-label"
                  label="User"
                  name="user"
                  value={
                    userInfo.role === "admin"
                      ? formData.user || ""
                      : userInfo._id}
                  onChange={(e) =>
                    setFormData({ ...formData, user: e.target.value })
                  }
                  disabled={userInfo.role !== "admin"}
                >
                  <MenuItem value="">
                    <em>Select User</em>
                  </MenuItem>

                  {users.map((u) => (
                    <MenuItem key={u._id} value={u._id}>
                      {u.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ gap: 2, flex: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ height: 25, minWidth: 200 }}
                >
                  {selectedEquipment ? "Update" : "Save"}
                </Button>

                <Button
                  variant="contained"
                  color="secondary"
                  sx={{ height: 25, minWidth: 200 }}
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          </form>
        </div>
      )}

      {/* Equipment Table */}
      <TableContainer component={Paper} sx={{ mt: 5 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>No</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Brand</TableCell>
              <TableCell>Property</TableCell>
              <TableCell>Number</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>User</TableCell>
              {userInfo.role === "admin" && (<TableCell>Actions</TableCell>)}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedEquipment.map((equipment, index) => (
              <TableRow key={equipment._id}>
                <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                <TableCell>{equipment.title}</TableCell>
                <TableCell>{equipment.brand}</TableCell>
                <TableCell>{equipment.property}</TableCell>
                <TableCell>{equipment.number}</TableCell>
                <TableCell>{equipment.status}</TableCell>
                <TableCell>{equipment.user?.name || "-"}</TableCell>
                {userInfo.role === "admin" && (<TableCell>
                  <IconButton onClick={() => handleEditClick(equipment)}>
                    <Edit color="primary" />
                  </IconButton>
                  <IconButton onClick={() => setDeleteId(equipment._id)}>
                    <Delete color="error" />
                  </IconButton>
                </TableCell>)}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Notification {...notification} onClose={closeNotification} />

      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Equipment</DialogTitle>

        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this equipment?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          mt: 2,
          px: 2,
          py: 1,
          borderTop: "1px solid #e0e0e0",
          backgroundColor: "#fafafa",
        }}
      >
        <TablePagination
          component="div"
          count={equipments.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Rows"
          sx={{
            ".MuiTablePagination-toolbar": {
              paddingLeft: 0,
              paddingRight: 0,
            },
            ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": {
              fontSize: "1rem",
            },
            "p.MuiTablePagination-selectLabel": {
              marginTop: "0.3rem",
              marginBottom: "0.3rem"
            },
            "p.MuiTablePagination-displayedRows": {
              marginTop: "0.3rem",
              marginBottom: "0.3rem"
            }
          }}
        />
      </Box>
    </Box>
  );
};

export default EquipmentScreen;
