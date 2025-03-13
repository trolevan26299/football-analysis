/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
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
  Lock as LockIcon,
  LockOpen as UnlockIcon,
} from "@mui/icons-material";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface User {
  _id: string;
  username: string;
  fullName: string;
  email: string;
  role: "ktv";
  status: "active" | "inactive";
  isOnline: boolean;
  lastLogin: string;
  currentTasks: number;
  totalTasksCompleted: number;
  createdAt: string;
}

interface FormData {
  username: string;
  password: string;
  fullName: string;
  email: string;
  status: "active" | "inactive";
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    username: "",
    password: "",
    fullName: "",
    email: "",
    status: "active",
  });
  const [resetPasswordDialog, setResetPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
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

  // Fetch users data
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Không thể tải dữ liệu người dùng");
      }

      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
    setPage(0);
  }, [searchTerm, users]);

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
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
    setEditingId(null);
    setFormData({
      username: "",
      password: "",
      fullName: "",
      email: "",
      status: "active",
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Handle edit
  const handleEdit = (id: string) => {
    const user = users.find((u) => u._id === id);
    if (user) {
      setFormData({
        username: user.username,
        password: "",
        fullName: user.fullName,
        email: user.email,
        status: user.status,
      });
      setEditingId(id);
      setOpenDialog(true);
    }
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
      setLoading(true);
      const response = await fetch(`/api/users/${confirmDialog.userId}`, {
        method: "DELETE",
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Không thể xóa người dùng");
      }

      // Hiển thị thông báo thành công
      setSuccess("Xóa người dùng thành công");

      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
      setConfirmDialog({ ...confirmDialog, open: false });
    }
  };

  const handleCancelDelete = () => {
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  // Handle toggle status
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      setLoading(true);
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      const response = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Không thể cập nhật trạng thái");
      }

      // Cập nhật state
      setUsers(users.map((user) => (user._id === id ? { ...user, status: newStatus as "active" | "inactive" } : user)));

      setSuccess(`Đã ${newStatus === "active" ? "kích hoạt" : "vô hiệu hóa"} tài khoản`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  // Handle reset password
  const handleResetPasswordClick = (id: string) => {
    setEditingId(id);
    setNewPassword("");
    setResetPasswordDialog(true);
  };

  const handleResetPassword = async () => {
    if (!editingId || !newPassword) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/users/${editingId}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: newPassword }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Không thể đặt lại mật khẩu");
      }

      setSuccess("Đặt lại mật khẩu thành công");
      setResetPasswordDialog(false);
      setNewPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  // Handle submit form
  const handleSubmit = async () => {
    // Validate form
    if (!formData.username || !formData.fullName || !formData.email) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    if (!editingId && !formData.password) {
      setError("Vui lòng nhập mật khẩu.");
      return;
    }

    try {
      setLoading(true);
      const url = editingId ? `/api/users/${editingId}` : "/api/users";
      const method = editingId ? "PUT" : "POST";

      // Tạo payload mới thay vì chỉnh sửa formData trực tiếp
      const payload: Record<string, any> = {
        username: formData.username,
        fullName: formData.fullName,
        email: formData.email,
        status: formData.status,
        role: "ktv",
      };

      // Chỉ thêm password vào payload nếu có giá trị
      if (formData.password) {
        payload.password = formData.password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Không thể lưu thông tin");
      }

      setSuccess(editingId ? "Cập nhật thành công" : "Thêm mới thành công");
      setOpenDialog(false);
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  if (loading && users.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && <ErrorAlert message={error} severity="error" onClose={() => setError(null)} variant="toast" />}

      {success && <ErrorAlert message={success} severity="success" onClose={() => setSuccess(null)} variant="toast" />}

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5">Quản lý KTV</Typography>
        <Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenDialog} sx={{ mr: 1 }}>
            Thêm KTV
          </Button>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchUsers}>
            Làm mới
          </Button>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm theo tên, email, tài khoản..."
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
              <TableCell>Công việc</TableCell>
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
                      color={user.isOnline ? "success" : "default"}
                    >
                      <Avatar>{user.username[0].toUpperCase()}</Avatar>
                    </Badge>
                    <Box>
                      <Typography variant="subtitle2">{user.fullName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
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
                  <Typography variant="body2">Đang xử lý: {user.currentTasks}</Typography>
                  <Typography variant="body2">Đã hoàn thành: {user.totalTasksCompleted}</Typography>
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
                      <LockIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={user.status === "active" ? "Vô hiệu hóa" : "Kích hoạt"}>
                    <IconButton
                      color={user.status === "active" ? "error" : "success"}
                      onClick={() => handleToggleStatus(user._id, user.status)}
                    >
                      {user.status === "active" ? <LockIcon /> : <UnlockIcon />}
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
              label="Tên đăng nhập"
              fullWidth
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              disabled={!!editingId}
            />
            {!editingId && (
              <TextField
                label="Mật khẩu"
                type="password"
                fullWidth
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            )}
            <TextField
              label="Họ tên"
              fullWidth
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.status === "active"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.checked ? "active" : "inactive",
                    })
                  }
                />
              }
              label="Tài khoản hoạt động"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editingId ? "Cập nhật" : "Thêm mới"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog
        open={resetPasswordDialog}
        onClose={() => {
          setResetPasswordDialog(false);
          setNewPassword("");
        }}
        maxWidth="xs"
        fullWidth
      >
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
          <Button
            onClick={() => {
              setResetPasswordDialog(false);
              setNewPassword("");
            }}
          >
            Hủy
          </Button>
          <Button variant="contained" onClick={handleResetPassword} disabled={!newPassword}>
            Xác nhận
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
        severity="error"
      />
    </Box>
  );
}
