"use client";
import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  TablePagination,
  Tooltip,
  Grid,
  Switch,
  FormControlLabel,
  Avatar,
  Badge,
  Stack,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Key as KeyIcon,
} from "@mui/icons-material";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

// Import RTK Query hooks
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useResetPasswordMutation,
} from "@/redux/services/rtk-query";

// Import Redux & Types
import { useAppDispatch, useAppSelector } from "@/redux/hooks/hooks";
import {
  setSearchTerm,
  updateFormData,
  resetFormData,
  setEditingUser,
  clearSuccess,
  clearError,
} from "@/redux/slices/usersSlice";

export default function UsersPage() {
  // Redux state
  const dispatch = useAppDispatch();
  const {
    formData,
    editingId,
    searchTerm,
    error: stateError,
    success: stateSuccess,
  } = useAppSelector((state) => state.users);

  // Local state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [resetPasswordDialog, setResetPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    userId: string;
    title: string;
    message: string;
  }>({
    open: false,
    userId: "",
    title: "",
    message: "",
  });

  // RTK Query hooks
  const { data: users = [], isLoading, error: queryError, refetch } = useGetUsersQuery();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();

  // Tính toán loading
  const loading = isLoading || isCreating || isUpdating || isDeleting || isResetting;

  // Kết hợp lỗi
  const error = queryError ? 'Lỗi tải dữ liệu' : stateError;

  // Filtered users
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchTerm(e.target.value));
  };

  // Handle pagination
  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle dialog open/close
  const handleOpenDialog = () => {
    dispatch(resetFormData());
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    dispatch(resetFormData());
  };

  // Handle edit
  const handleEdit = (id: string) => {
    dispatch(setEditingUser(id));
    setOpenDialog(true);
  };

  // Handle delete
  const handleDeleteClick = (userId: string) => {
    setConfirmDialog({
      open: true,
      userId: userId,
      title: "Xác nhận xóa",
      message: "Bạn có chắc chắn muốn xóa người dùng này?",
    });
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteUser(confirmDialog.userId).unwrap();
    } catch (err) {
      console.error("Failed to delete user:", err);
    } finally {
      setConfirmDialog({ ...confirmDialog, open: false });
    }
  };

  const handleCancelDelete = () => {
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  // Handle reset password
  const handleResetPasswordClick = (id: string) => {
    dispatch(setEditingUser(id));
    setNewPassword("");
    setResetPasswordDialog(true);
  };

  const handleResetPassword = async () => {
    if (!editingId || !newPassword) return;

    try {
      await resetPassword({ id: editingId, password: newPassword }).unwrap();
      setResetPasswordDialog(false);
      setNewPassword("");
    } catch (err) {
      console.error("Failed to reset password:", err);
    }
  };

  // Handle submit form
  const handleSubmit = async () => {
    // Validate form - Chỉ yêu cầu username và fullName
    if (!formData.username || !formData.fullName) {
      return;
    }

    if (!editingId && !formData.password) {
      return;
    }

    try {
      if (editingId) {
        await updateUser({
          id: editingId,
          body: {
            fullName: formData.fullName,
            status: formData.status,
            role: formData.role,
            ...(formData.password ? { password: formData.password } : {}),
          },
        }).unwrap();
      } else {
        await createUser({
          username: formData.username,
          password: formData.password || '',
          fullName: formData.fullName,
          status: formData.status,
          role: formData.role || 'ktv',
        }).unwrap();
      }
      setOpenDialog(false);
    } catch (err) {
      console.error("Failed to save user:", err);
    }
  };

  // Handle form change
  const handleFormChange = (field: string, value: string | boolean) => {
    dispatch(updateFormData({ [field]: value }));
  };

  // Clear notifications
  const handleClearSuccess = () => {
    dispatch(clearSuccess());
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  if (loading && users.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && <ErrorAlert message={error} severity="error" onClose={handleClearError} variant="toast" />}

      {stateSuccess && <ErrorAlert message={stateSuccess} severity="success" onClose={handleClearSuccess} variant="toast" />}

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5">Quản lý KTV</Typography>
        <Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenDialog} sx={{ mr: 1 }}>
            Thêm KTV
          </Button>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => refetch()}>
            Làm mới
          </Button>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm theo tên, tài khoản..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: "action.active", mr: 1 }} />,
            }}
          />
        </Grid>
      </Grid>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Thông tin KTV</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Số công việc đã hoàn thành</TableCell>
              <TableCell>Đăng nhập cuối</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
              <TableRow key={user._id}>
                <TableCell>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                      variant="dot"
                      color={user.status === "active" ? "success" : "default"}
                    >
                      <Avatar>{user.username[0].toUpperCase()}</Avatar>
                    </Badge>
                    <Box>
                      <Typography variant="subtitle2">{user.fullName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        @{user.username}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={user.status === "active" ? <ActiveIcon /> : <InactiveIcon />}
                    label={user.status === "active" ? "Hoạt động" : "Không hoạt động"}
                    color={user.status === "active" ? "success" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {user.totalTasksCompleted || 0}
                  </Typography>
                </TableCell>
                <TableCell>
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleString("vi-VN") : "Chưa đăng nhập"}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Sửa thông tin">
                    <IconButton
                      onClick={() => {
                        handleEdit(user._id);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Đặt lại mật khẩu">
                    <IconButton
                      onClick={() => {
                        handleResetPasswordClick(user._id);
                      }}
                    >
                      <KeyIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Xóa">
                    <IconButton color="error" onClick={() => handleDeleteClick(user._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredUsers.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage="Số dòng mỗi trang:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
      />

      {/* Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? "Chỉnh sửa thông tin KTV" : "Thêm KTV mới"}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Tên đăng nhập *"
              fullWidth
              value={formData.username}
              onChange={(e) => handleFormChange('username', e.target.value)}
              disabled={!!editingId}
              required
            />
            {!editingId && (
              <TextField
                label="Mật khẩu *"
                type="password"
                fullWidth
                value={formData.password}
                onChange={(e) => handleFormChange('password', e.target.value)}
                required
              />
            )}
            <TextField
              label="Họ tên *"
              fullWidth
              value={formData.fullName}
              onChange={(e) => handleFormChange('fullName', e.target.value)}
              required
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.status === "active"}
                  onChange={(e) => handleFormChange('status', e.target.checked ? "active" : "inactive")}
                  color="primary"
                />
              }
              label="Hoạt động"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {editingId ? "Cập nhật" : "Thêm mới"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordDialog} onClose={() => setResetPasswordDialog(false)}>
        <DialogTitle>Đặt lại mật khẩu</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              label="Mật khẩu mới"
              type="password"
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetPasswordDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleResetPassword} disabled={!newPassword || loading}>
            Đặt lại mật khẩu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </Box>
  );
}
