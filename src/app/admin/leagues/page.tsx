"use client";
import { useState } from "react";
import {
  Box,
  Button,
  Paper,
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
  MenuItem,
  TablePagination,
  Switch,
  FormControlLabel,
  Tooltip,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PageTitle from "@/components/ui/PageTitle";
import StatusChip from "@/components/ui/StatusChip";
import {
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";

// Import RTK Query hooks
import {
  useGetLeaguesQuery,
  useCreateLeagueMutation,
  useUpdateLeagueMutation,
  useDeleteLeagueMutation,
} from "@/redux/services/rtk-query";

// Import types
import { League, LeagueFormData } from "@/types";

const initialFormData: LeagueFormData = {
  name: "",
  country: "",
  season: new Date().getFullYear().toString(),
  status: "active",
};

export default function LeaguesPage() {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [showInactiveLeagues, setShowInactiveLeagues] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<LeagueFormData>(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
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

  // RTK Query hooks
  const { data: leagues = [], isLoading, error: queryError, refetch } = useGetLeaguesQuery({ 
    status: showInactiveLeagues ? undefined : 'active' 
  });
  const [createLeague, { isLoading: isCreating, error: createError }] = useCreateLeagueMutation();
  const [updateLeague, { isLoading: isUpdating, error: updateError }] = useUpdateLeagueMutation();
  const [deleteLeague, { isLoading: isDeleting, error: deleteError }] = useDeleteLeagueMutation();
  
  // Tính toán loading
  const loading = isLoading || isCreating || isUpdating || isDeleting;
  
  // Kết hợp lỗi
  const error = queryError || createError || updateError || deleteError 
    ? 'Đã xảy ra lỗi khi làm việc với dữ liệu giải đấu' 
    : null;
  
  // Thông báo thành công
  const [success, setSuccess] = useState<string | null>(null);

  // Handle form submission
  const handleSubmit = async () => {
    // Kiểm tra dữ liệu đầu vào
    if (!formData.name || !formData.country || !formData.season) {
      return;
    }

    try {
      if (editingId) {
        await updateLeague({
          id: editingId,
          body: formData,
        }).unwrap();
        setSuccess("Cập nhật giải đấu thành công");
      } else {
        await createLeague(formData).unwrap();
        setSuccess("Thêm giải đấu mới thành công");
      }
      handleCloseDialog();
    } catch (err) {
      console.error("Failed to save league:", err);
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
      await deleteLeague(confirmDialog.leagueId).unwrap();
      setSuccess("Xóa giải đấu thành công");
    } catch (err) {
      console.error("Failed to delete league:", err);
    } finally {
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

  // Filter leagues
  const filteredLeagues = leagues.filter(
    (league) =>
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

  if (loading && leagues.length === 0) {
    return <LoadingSpinner 
      variant="overlay" 
      message="Đang tải dữ liệu..." 
      overlayColor={theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)'}
    />;
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && <ErrorAlert message={error} severity="error" variant="toast" onClose={() => null} />}
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
        <PageTitle 
          title="Quản lý giải đấu" 
          sx={{ color: theme.palette.mode === 'dark' ? '#ffffff' : undefined }}
        />
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
          bgcolor: (theme) => 
            theme.palette.mode === "dark" ? 'rgba(18, 18, 18, 0.9)' : 'background.paper',
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
            onClick={() => refetch()}
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
          bgcolor: (theme) => 
            theme.palette.mode === "dark" ? 'rgba(18, 18, 18, 0.9)' : 'background.paper',
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ 
                fontWeight: 600,
                color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : undefined
              }}>
                Tên giải
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 600,
                color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : undefined
              }}>
                Quốc gia
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 600,
                color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : undefined
              }}>
                Mùa giải
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 600,
                color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : undefined
              }}>
                Trạng thái
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 600,
                color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : undefined
              }}>
                Ngày tạo
              </TableCell>
              <TableCell align="right" sx={{ 
                fontWeight: 600,
                color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : undefined
              }}>
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
            bgcolor: (theme) => 
              theme.palette.mode === "dark" ? 'rgba(18, 18, 18, 0.95)' : 'background.paper',
          },
        }}
      >
        <DialogTitle sx={{
          color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : undefined
        }}>
          {editingId ? "Chỉnh sửa giải đấu" : "Thêm giải đấu mới"}
        </DialogTitle>
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
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
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
