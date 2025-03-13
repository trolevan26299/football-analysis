"use client";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ErrorAlert from "@/components/ui/ErrorAlert";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import StatusChip from "@/components/ui/StatusChip";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useEffect, useState } from "react";

interface League {
  _id: string;
  name: string;
  country: string;
  season: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

interface LeagueFormData {
  name: string;
  country: string;
  season: string;
  status: "active" | "inactive";
}

const initialFormData: LeagueFormData = {
  name: "",
  country: "",
  season: new Date().getFullYear().toString(),
  status: "active",
};

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<LeagueFormData>(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [showInactiveLeagues, setShowInactiveLeagues] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    leagueId: string;
    title: string;
    message: string;
  }>({
    open: false,
    leagueId: "",
    title: "",
    message: "",
  });

  // Fetch leagues data
  const fetchLeagues = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/leagues");
      if (!response.ok) throw new Error("Không thể tải dữ liệu giải đấu");
      const data = await response.json();
      setLeagues(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeagues();
  }, []);

  // Handle form submission
  const handleSubmit = async () => {
    // Kiểm tra dữ liệu đầu vào
    if (!formData.name || !formData.country || !formData.season) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      setLoading(true);
      const url = editingId ? `/api/leagues/${editingId}` : "/api/leagues";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Không thể lưu giải đấu");
      }

      // Hiển thị thông báo thành công
      setSuccess(editingId ? "Cập nhật giải đấu thành công" : "Thêm giải đấu mới thành công");

      await fetchLeagues();
      handleCloseDialog();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDeleteClick = (leagueId: string) => {
    setConfirmDialog({
      open: true,
      leagueId: leagueId,
      title: "Xác nhận xóa",
      message: "Bạn có chắc chắn muốn xóa giải đấu này?",
    });
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/leagues/${confirmDialog.leagueId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Không thể xóa giải đấu");
      }

      // Cập nhật dữ liệu
      setLeagues(leagues.filter((league) => league._id !== confirmDialog.leagueId));
      setSuccess("Xóa giải đấu thành công");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
      // Đóng dialog xác nhận
      setConfirmDialog({ ...confirmDialog, open: false });
    }
  };

  const handleCancelDelete = () => {
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  const handleDelete = (id: string) => {
    handleDeleteClick(id);
  };

  // Dialog handlers
  const handleOpenDialog = (league?: League) => {
    if (league) {
      setFormData({
        name: league.name,
        country: league.country,
        season: league.season,
        status: league.status,
      });
      setEditingId(league._id);
    } else {
      setFormData(initialFormData);
      setEditingId(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData(initialFormData);
    setEditingId(null);
  };

  // Filter and pagination handlers
  const filteredLeagues = leagues.filter(
    (league) =>
      (showInactiveLeagues || league.status === "active") &&
      (league.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        league.country.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return <LoadingSpinner variant="overlay" message="Đang tải dữ liệu..." />;
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && <ErrorAlert message={error} severity="error" variant="toast" onClose={() => setError(null)} />}
      {success && <ErrorAlert message={success} severity="success" variant="toast" onClose={() => setSuccess(null)} />}

      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 4,
          alignItems: "center",
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            position: "relative",
            display: "inline-block",
            "&:after": {
              content: '""',
              position: "absolute",
              bottom: -8,
              left: 0,
              width: 40,
              height: 4,
              borderRadius: 2,
              bgcolor: "primary.main",
            },
          }}
        >
          Quản lý giải đấu
        </Typography>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={() => handleOpenDialog()}
          sx={{
            px: 2.5,
            py: 1,
            borderRadius: "12px",
          }}
        >
          Thêm giải đấu
        </Button>
      </Box>

      {/* Filters */}
      <Paper
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: "16px",
          boxShadow: (theme) =>
            theme.palette.mode === "light"
              ? "0 2px 6px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02)"
              : "0 2px 6px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
          <TextField
            label="Tìm kiếm"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
            }}
            sx={{
              minWidth: 240,
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
              },
            }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={showInactiveLeagues}
                onChange={(e) => setShowInactiveLeagues(e.target.checked)}
                color="primary"
              />
            }
            label="Hiển thị giải đấu không hoạt động"
            sx={{
              mx: 1,
              "& .MuiFormControlLabel-label": {
                fontWeight: 500,
              },
            }}
          />
          <Button
            startIcon={<RefreshIcon />}
            onClick={fetchLeagues}
            variant="outlined"
            sx={{
              borderRadius: "10px",
              ml: "auto",
            }}
          >
            Làm mới
          </Button>
        </Box>
      </Paper>

      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: (theme) =>
            theme.palette.mode === "light"
              ? "0 2px 6px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02)"
              : "0 2px 6px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Tên giải</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Quốc gia</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Mùa giải</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Ngày tạo</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLeagues.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((league) => (
              <TableRow
                key={league._id}
                sx={{
                  transition: "background-color 0.15s ease",
                  "&:hover": {
                    backgroundColor: (theme) =>
                      theme.palette.mode === "light" ? "rgba(0, 0, 0, 0.04)" : "rgba(255, 255, 255, 0.04)",
                  },
                }}
              >
                <TableCell sx={{ fontWeight: 500 }}>{league.name}</TableCell>
                <TableCell>{league.country}</TableCell>
                <TableCell>{league.season}</TableCell>
                <TableCell>
                  <StatusChip
                    status={league.status}
                    label={league.status === "active" ? "Hoạt động" : "Không hoạt động"}
                    size="small"
                    variant="filled"
                  />
                </TableCell>
                <TableCell>{new Date(league.createdAt).toLocaleDateString("vi-VN")}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Sửa">
                    <IconButton
                      onClick={() => handleOpenDialog(league)}
                      sx={{
                        color: "primary.main",
                        "&:hover": {
                          backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                        },
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Xóa">
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(league._id)}
                      sx={{
                        ml: 1,
                        "&:hover": {
                          backgroundColor: (theme) => alpha(theme.palette.error.main, 0.1),
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredLeagues.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số hàng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} trên ${count}`}
          sx={{
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        />
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle>{editingId ? "Chỉnh sửa giải đấu" : "Thêm giải đấu mới"}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Tên giải"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="Quốc gia"
              fullWidth
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            />
            <TextField
              label="Mùa giải"
              fullWidth
              value={formData.season}
              onChange={(e) => setFormData({ ...formData, season: e.target.value })}
            />
            <TextField
              select
              label="Trạng thái"
              fullWidth
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
            >
              <MenuItem value="active">Hoạt động</MenuItem>
              <MenuItem value="inactive">Không hoạt động</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editingId ? "Cập nhật" : "Thêm mới"}
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
