/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
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
  MenuItem,
  Chip,
  TablePagination,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  alpha,
} from "@mui/material";

import vi from 'date-fns/locale/vi';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Article as ArticleIcon,
  Analytics as AnalyticsIcon,
} from "@mui/icons-material";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import StatusChip from "@/components/ui/StatusChip";
import PageTitle from "@/components/ui/PageTitle";

// Import RTK Query hooks
import {
  useGetMatchesQuery,
  useGetLeaguesQuery,
  useCreateMatchMutation,
  useUpdateMatchMutation,
  useDeleteMatchMutation,
} from "@/redux/services/rtk-query";

// Import types
import { Match } from "@/types";

interface MatchFormData {
  leagueId: string;
  homeTeamName: string;
  awayTeamName: string;
  matchDate: Date | string;
}

// Status labels - Đơn giản hóa chỉ còn 2 trạng thái
const statusLabels: { [key: string]: string } = {
  scheduled: "Chưa diễn ra",
  finished: "Đã diễn ra"
};

const initialFormData: MatchFormData = {
  leagueId: "",
  homeTeamName: "",
  awayTeamName: "",
  matchDate: new Date().toISOString(),
};

export default function MatchesPage() {
  // Trạng thái local
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filterLeague, setFilterLeague] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("scheduled");
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<MatchFormData>(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openAnalyzeDialog, setOpenAnalyzeDialog] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [openAnalysis, setOpenAnalysis] = useState(false);
  const [analysisMatch, setAnalysisMatch] = useState<Match | null>(null);

  // Debounce effect cho tìm kiếm
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timerId);
  }, [searchTerm]);

  // RTK Query hooks
  const { 
    data = { 
      matches: [], 
      pagination: { total: 0, page: 1, limit: 10, totalPages: 1 } 
    }, 
    isLoading, 
    error, 
    refetch 
  } = useGetMatchesQuery(
    { 
      page: page + 1, // API dùng page bắt đầu từ 1
      limit: rowsPerPage, 
      search: debouncedSearchTerm,
      leagueId: filterLeague || undefined,
      status: filterStatus || undefined
    }
  );


  const { data: leagues = [] } = useGetLeaguesQuery({ status: 'active' });

  const [createMatch, { isLoading: isCreating }] = useCreateMatchMutation();
  const [updateMatch, { isLoading: isUpdating }] = useUpdateMatchMutation();
  const [deleteMatch, { isLoading: isDeleting }] = useDeleteMatchMutation();

  // Tính toán loading
  const loading = isLoading || isCreating || isUpdating || isDeleting;
  
  // Kết hợp lỗi
  const errorMessage = error ? 'Đã xảy ra lỗi khi làm việc với dữ liệu trận đấu' : null;

  // Handle form submission
  const handleSubmit = async () => {
    // Kiểm tra dữ liệu đầu vào - chỉ các trường bắt buộc
    if (!formData.leagueId || !formData.homeTeamName || !formData.awayTeamName || !formData.matchDate) {
      // Hiển thị thông báo lỗi
      setSuccess("Vui lòng nhập đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      // Đảm bảo matchDate luôn là string
      const matchDateString = typeof formData.matchDate === 'string' 
        ? formData.matchDate 
        : formData.matchDate.toISOString();
      
      // Kiểm tra ngày thi đấu để xác định trạng thái
      const matchDate = new Date(matchDateString);
      const currentDate = new Date();
      
      // Lấy chỉ ngày, bỏ qua giờ phút giây để so sánh chính xác
      // Sử dụng UTC để tránh vấn đề múi giờ
      const matchDateOnly = new Date(Date.UTC(matchDate.getFullYear(), matchDate.getMonth(), matchDate.getDate()));
      const currentDateOnly = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()));
    
      
      // Xác định trạng thái dựa trên ngày thi đấu
      // Nếu ngày trận đấu >= ngày hiện tại thì là "scheduled" (chưa diễn ra)
      const matchStatus = matchDateOnly >= currentDateOnly ? "scheduled" : "finished";
      
      // Đơn giản hoá dữ liệu
      const matchData = {
        leagueId: formData.leagueId,
        homeTeamName: formData.homeTeamName,
        awayTeamName: formData.awayTeamName,
        matchDate: matchDateString,
        status: matchStatus, // Thêm trạng thái
      };
      
      console.log('DEBUG - Sending match data with status:', matchStatus);
      
      if (editingId) {
        await updateMatch({
          id: editingId,
          ...matchData
        }).unwrap();
        setSuccess("Cập nhật trận đấu thành công");
      } else {
        await createMatch(matchData).unwrap();
        setSuccess("Thêm trận đấu mới thành công");
      }
      
      setOpenDialog(false);
      setFormData(initialFormData);
      refetch();
    } catch (err) {
      console.error("Failed to save match:", err);
      setSuccess("Có lỗi xảy ra khi lưu trận đấu");
    }
  };

  // Handle delete
  const handleDeleteClick = (matchId: string) => {
    setOpenConfirmDialog(true);
    setDeleteId(matchId);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteMatch(deleteId as string).unwrap();
      setSuccess("Xóa trận đấu thành công");
    } catch (err) {
      console.error("Failed to delete match:", err);
    } finally {
      // Đóng dialog xác nhận
      setOpenConfirmDialog(false);
    }
  };

  const handleCancelDelete = () => {
    setOpenConfirmDialog(false);
  };

  const handleDelete = (id: string) => {
    handleDeleteClick(id);
  };

  // Handle analysis
  const handleOpenAnalysis = (match: Match) => {
    setSelectedMatch(match);
    setOpenAnalysis(true);
  };

  // Hàm mở dialog xác nhận phân tích
  const handleOpenAnalyzeDialog = (match: Match) => {
    setAnalysisMatch(match);
    setOpenAnalyzeDialog(true);
  };

  // Hàm đóng dialog phân tích
  const handleCloseAnalyzeDialog = () => {
    setOpenAnalyzeDialog(false);
  };

  // Hàm thực hiện phân tích
  const handleAnalyze = async () => {
    if (!analysisMatch) return;

    try {
      const response = await fetch(`/api/matches/${analysisMatch._id}/analyze`, {
        method: "POST",
      });

      if (response.ok) {
        setSuccess("Bắt đầu phân tích trận đấu thành công");
      } else {
        const errorData = await response.json();
        setSuccess(errorData.error || "Lỗi khi phân tích trận đấu");
      }

      // Đóng dialog và làm mới dữ liệu
      handleCloseAnalyzeDialog();
      refetch();
    } catch (err) {
      console.error("Failed to analyze match:", err);
      setSuccess("Có lỗi xảy ra khi phân tích trận đấu");
    }
  };

  // Xử lý phân trang từ API
  useEffect(() => {
    // Khi nhận được dữ liệu mới từ API, reset page nếu cần
    if (data && page >= data.pagination.totalPages) {
      setPage(Math.max(0, data.pagination.totalPages - 1));
    }
  }, [data, page]);

  // Tự động refetch khi filter thay đổi
  useEffect(() => {
    refetch();
    // Reset về trang đầu tiên khi thay đổi filter
    setPage(0);
  }, [debouncedSearchTerm, filterLeague, filterStatus, refetch]);

  if (loading && !data.matches.length) {
    return <LoadingSpinner variant="overlay" message="Đang tải dữ liệu..." />;
  }

  return (
    <Box sx={{ p: 3 }}>
      {errorMessage && <ErrorAlert message={errorMessage} severity="error" variant="toast" onClose={() => null} />}
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
        <PageTitle title="Quản lý trận đấu" />
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={() => {
            setFormData(initialFormData);
            setEditingId(null);
            setOpenDialog(true);
          }}
          sx={{
            px: 2.5,
            py: 1,
            borderRadius: "12px",
          }}
        >
          Thêm trận đấu
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
        <Grid container spacing={2.5} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Tìm kiếm"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small" sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}>
              <InputLabel>Giải đấu</InputLabel>
              <Select value={filterLeague} label="Giải đấu" onChange={(e) => setFilterLeague(e.target.value)}>
                <MenuItem value="">Tất cả</MenuItem>
                {leagues.map((league) => (
                  <MenuItem key={league._id} value={league._id}>
                    {league.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small" sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}>
              <InputLabel>Trạng thái</InputLabel>
              <Select value={filterStatus} label="Trạng thái" onChange={(e) => setFilterStatus(e.target.value)}>
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="scheduled">Chưa diễn ra</MenuItem>
                <MenuItem value="finished">Đã diễn ra</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              fullWidth
              startIcon={<RefreshIcon />}
              onClick={() => refetch()}
              variant="outlined"
              sx={{
                py: 0.9,
                borderRadius: "10px",
              }}
            >
              Làm mới
            </Button>
          </Grid>
        </Grid>
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
              <TableCell sx={{ fontWeight: 600 }}>Giải đấu</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Trận đấu</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Thời gian</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Phân tích</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.matches.map((match: Match) => (
              <TableRow
                key={match._id}
                sx={{
                  transition: "background-color 0.15s ease",
                  "&:hover": {
                    backgroundColor: (theme) =>
                      theme.palette.mode === "light" ? "rgba(0, 0, 0, 0.04)" : "rgba(255, 255, 255, 0.04)",
                  },
                }}
              >
                <TableCell>{match.leagueId?.name}</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {match.homeTeam.name} vs {match.awayTeam.name}
                  </Stack>
                </TableCell>
                <TableCell>
                  {new Date(match.matchDate).toLocaleDateString("vi-VN")}
                </TableCell>
                <TableCell>
                  <StatusChip status={match.status} label={statusLabels[match.status]} size="small" variant="filled" />
                </TableCell>
                <TableCell>
                  <StatusChip
                    status={match.analysisInfo?.isAnalyzed ? "success" : "pending"}
                    label={match.analysisInfo?.isAnalyzed ? "Đã phân tích" : "Chưa phân tích"}
                    size="small"
                    variant="filled"
                    withIcon={true}
                    onClick={() => handleOpenAnalysis(match)}
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Sửa">
                    <IconButton
                      onClick={() => {
                        setFormData({
                          leagueId: match.leagueId._id,
                          homeTeamName: match.homeTeam.name,
                          awayTeamName: match.awayTeam.name,
                          matchDate: new Date(match.matchDate).toISOString()
                        });
                        setEditingId(match._id);
                        setOpenDialog(true);
                      }}
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
                      onClick={() => handleDelete(match._id)}
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
                  {/* Thêm nút phân tích */}
                  {match.status === "scheduled" && !match.analysisInfo?.isAnalyzed && (
                    <Tooltip title="Phân tích trận đấu">
                      <IconButton
                        size="small"
                        color="secondary"
                        onClick={() => handleOpenAnalyzeDialog(match)}
                      >
                        <AnalyticsIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={data.pagination.total}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
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
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle>{editingId ? "Chỉnh sửa trận đấu" : "Thêm trận đấu mới"}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Giải đấu</InputLabel>
              <Select
                value={formData.leagueId}
                label="Giải đấu"
                onChange={(e) => setFormData({ ...formData, leagueId: e.target.value })}
              >
                {leagues.map((league) => (
                  <MenuItem key={league._id} value={league._id}>
                    {league.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Đội nhà"
                  value={formData.homeTeamName}
                  onChange={(e) => setFormData({ ...formData, homeTeamName: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Đội khách"
                  value={formData.awayTeamName}
                  onChange={(e) => setFormData({ ...formData, awayTeamName: e.target.value })}
                />
              </Grid>
            </Grid>

            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
              <DatePicker
                label="Thời gian thi đấu"
                value={typeof formData.matchDate === 'string' ? new Date(formData.matchDate) : formData.matchDate}
                onChange={(newValue: Date | null) => 
                  newValue && setFormData({ 
                    ...formData, 
                    matchDate: newValue.toISOString()
                  })
                }
              />
            </LocalizationProvider>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {editingId ? "Cập nhật" : "Thêm mới"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Analysis Dialog */}
      <Dialog open={openAnalysis} onClose={() => setOpenAnalysis(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Thông tin phân tích
          {selectedMatch && (
            <Typography variant="subtitle1" color="text.secondary">
              {selectedMatch.homeTeam.name} vs {selectedMatch.awayTeam.name}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedMatch && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Bài viết đã thu thập
              </Typography>
              <List>
                {selectedMatch.analysis?.articles ? (
                  selectedMatch.analysis.articles.map((article: { title: string; url: string; source: string }, index: number) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <ArticleIcon />
                      </ListItemIcon>
                      <ListItemText primary={article.title} secondary={article.source} />
                      <Button href={article.url} target="_blank" rel="noopener noreferrer">
                        Xem
                      </Button>
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="Chưa có bài viết nào được thu thập" />
                  </ListItem>
                )}
              </List>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Phân tích AI
              </Typography>
              <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                <Typography>{selectedMatch.analysis?.aiAnalysis?.content || "Chưa có phân tích"}</Typography>
                {selectedMatch.analysis?.aiAnalysis?.generatedAt && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                    Tạo lúc: {new Date(selectedMatch.analysis.aiAnalysis.generatedAt).toLocaleString("vi-VN")}
                  </Typography>
                )}
              </Paper>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Bài viết WordPress
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                {selectedMatch.analysis?.wordpressPost ? (
                  <>
                    <Chip
                      label={selectedMatch.analysis.wordpressPost.status}
                      color={
                        selectedMatch.analysis.wordpressPost.status === "published"
                          ? "success"
                          : selectedMatch.analysis.wordpressPost.status === "draft"
                          ? "warning"
                          : "error"
                      }
                    />
                    {selectedMatch.analysis.wordpressPost.url && (
                      <Button href={selectedMatch.analysis.wordpressPost.url} target="_blank" rel="noopener noreferrer">
                        Xem bài viết
                      </Button>
                    )}
                  </>
                ) : (
                  <Chip label="Chưa có bài viết" color="default" />
                )}
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAnalysis(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={openConfirmDialog}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa trận đấu này?"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        severity="error"
      />

      {/* Dialog xác nhận phân tích */}
      <Dialog open={openAnalyzeDialog} onClose={handleCloseAnalyzeDialog}>
        <DialogTitle>Xác nhận phân tích trận đấu</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn phân tích trận đấu này?
          </Typography>
          <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: "bold" }}>
            {analysisMatch && `${analysisMatch.homeTeam.name} vs ${analysisMatch.awayTeam.name}`}
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Quá trình phân tích sẽ:
            <ul>
              <li>Tìm kiếm thông tin về hai đội bóng trên internet</li>
              <li>Thu thập các bài viết phân tích</li>
              <li>Tạo bài viết phân tích bằng AI</li>
            </ul>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAnalyzeDialog}>Hủy</Button>
          <Button 
            onClick={handleAnalyze} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Phân tích"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
