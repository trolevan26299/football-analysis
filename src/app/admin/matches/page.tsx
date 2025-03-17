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

import { vi } from "date-fns/locale";
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
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import StatusChip from "@/components/ui/StatusChip";
import PageTitle from "@/components/ui/PageTitle";

interface Match {
  _id: string;
  leagueId: string;
  homeTeam: {
    name: string;
    logo: string;
    score: number;
  };
  awayTeam: {
    name: string;
    logo: string;
    score: number;
  };
  matchDate: string;
  kickoffTime: string;
  venue: {
    name: string;
    city: string;
  };
  status: "scheduled" | "live" | "finished" | "postponed" | "cancelled";
  round: string;
  analysis: {
    isAnalyzed: boolean;
    aiStatus: "not_generated" | "processing" | "generated";
    articles: Array<{
      title: string;
      url: string;
      source: string;
    }>;
    aiAnalysis: {
      content: string;
      generatedAt: string;
      status: "pending" | "generating" | "generated" | "failed";
    };
    wordpressPost: {
      postId: string;
      status: "draft" | "published" | "failed";
      publishedAt: string;
      url: string;
    };
  };
}

interface League {
  _id: string;
  name: string;
  country: string;
  status: "active" | "inactive";
}

interface MatchFormData {
  leagueId: string;
  homeTeamName: string;
  awayTeamName: string;
  matchDate: Date;
  kickoffTime: string;
  venueName: string;
  venueCity: string;
  round: string;
  status: "scheduled" | "live" | "finished" | "postponed" | "cancelled";
}

const initialFormData: MatchFormData = {
  leagueId: "",
  homeTeamName: "",
  awayTeamName: "",
  matchDate: new Date(),
  kickoffTime: "00:00",
  venueName: "",
  venueCity: "",
  round: "",
  status: "scheduled",
};


const statusLabels = {
  scheduled: "Lên lịch",
  live: "Đang diễn ra",
  finished: "Kết thúc",
  postponed: "Hoãn",
  cancelled: "Hủy",
};

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<MatchFormData>(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLeague, setFilterLeague] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [openAnalysisDialog, setOpenAnalysisDialog] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    matchId: string;
    title: string;
    message: string;
  }>({
    open: false,
    matchId: "",
    title: "",
    message: "",
  });
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [analyzeDialog, setAnalyzeDialog] = useState<{
    open: boolean;
    matchId: string;
    matchName: string;
  }>({
    open: false,
    matchId: "",
    matchName: "",
  });

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [matchesRes, leaguesRes] = await Promise.all([fetch("/api/matches"), fetch("/api/leagues")]);

      if (!matchesRes.ok || !leaguesRes.ok) {
        throw new Error("Không thể tải dữ liệu");
      }

      const [matchesData, leaguesData] = await Promise.all([matchesRes.json(), leaguesRes.json()]);

      setMatches(matchesData);
      setLeagues(leaguesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle form submission
  const handleSubmit = async () => {
    // Kiểm tra dữ liệu đầu vào
    if (!formData.leagueId || !formData.homeTeamName || !formData.awayTeamName || !formData.matchDate) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      setLoading(true);
      const url = editingId ? `/api/matches/${editingId}` : "/api/matches";
      const method = editingId ? "PUT" : "POST";

      // Chuyển đổi dữ liệu form để gửi lên API
      const requestData = {
        ...formData,
        matchDate: formData.matchDate.toISOString(), // Chuyển đổi Date thành string
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Không thể lưu trận đấu");
      }

      // Hiển thị thông báo thành công
      setSuccess(editingId ? "Cập nhật trận đấu thành công" : "Thêm trận đấu mới thành công");

      // Đóng dialog và làm mới dữ liệu
      setOpenDialog(false);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDeleteClick = (matchId: string) => {
    setConfirmDialog({
      open: true,
      matchId: matchId,
      title: "Xác nhận xóa",
      message: "Bạn có chắc chắn muốn xóa trận đấu này?",
    });
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/matches/${confirmDialog.matchId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Không thể xóa trận đấu");
      }

      // Cập nhật dữ liệu
      setMatches(matches.filter((match) => match._id !== confirmDialog.matchId));
      setSuccess("Xóa trận đấu thành công");
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

  // Handle analysis
  const handleOpenAnalysis = (match: Match) => {
    setSelectedMatch(match);
    setOpenAnalysisDialog(true);
  };

  // Filter matches
  const filteredMatches = matches.filter((match) => {
    const matchesSearch =
      match.homeTeam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.awayTeam.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLeague = filterLeague ? match.leagueId === filterLeague : true;
    const matchesStatus = filterStatus ? match.status === filterStatus : true;

    return matchesSearch && matchesLeague && matchesStatus;
  });

  // Hàm mở dialog xác nhận phân tích
  const handleOpenAnalyzeDialog = (match: Match) => {
    setAnalyzeDialog({
      open: true,
      matchId: match._id,
      matchName: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
    });
  };

  // Hàm đóng dialog phân tích
  const handleCloseAnalyzeDialog = () => {
    setAnalyzeDialog({
      ...analyzeDialog,
      open: false,
    });
  };

  // Hàm thực hiện phân tích
  const handleAnalyze = async () => {
    try {
      setAnalyzeLoading(true);
      const response = await fetch(`/api/matches/${analyzeDialog.matchId}/analyze`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Lỗi khi phân tích trận đấu");
      }

      // Hiển thị thông báo thành công
      setSuccess("Bắt đầu quá trình phân tích trận đấu thành công");
      
      // Đóng dialog và làm mới dữ liệu
      handleCloseAnalyzeDialog();
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setAnalyzeLoading(false);
    }
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
                {Object.entries(statusLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              fullWidth
              startIcon={<RefreshIcon />}
              onClick={fetchData}
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
              <TableCell sx={{ fontWeight: 600 }}>Sân</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Phân tích</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMatches.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((match) => (
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
                <TableCell>{leagues.find((l) => l._id === match.leagueId)?.name}</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {match.homeTeam.name} vs {match.awayTeam.name}
                  </Stack>
                </TableCell>
                <TableCell>
                  {new Date(match.matchDate).toLocaleDateString("vi-VN")}
                  <br />
                  <Typography variant="caption" color="text.secondary">
                    {match.kickoffTime}
                  </Typography>
                </TableCell>
                <TableCell>
                  {match.venue.name}
                  <br />
                  <Typography variant="caption" color="text.secondary">
                    {match.venue.city}
                  </Typography>
                </TableCell>
                <TableCell>
                  <StatusChip status={match.status} label={statusLabels[match.status]} size="small" variant="filled" />
                </TableCell>
                <TableCell>
                  <StatusChip
                    status={match.analysis?.isAnalyzed ? "success" : "pending"}
                    label={match.analysis?.isAnalyzed ? "Đã phân tích" : "Chưa phân tích"}
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
                          leagueId: match.leagueId,
                          homeTeamName: match.homeTeam.name,
                          awayTeamName: match.awayTeam.name,
                          matchDate: new Date(match.matchDate),
                          kickoffTime: match.kickoffTime,
                          venueName: match.venue.name,
                          venueCity: match.venue.city,
                          round: match.round,
                          status: match.status,
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
                  {match.status === "scheduled" && (
                    <Tooltip title="Phân tích trận đấu">
                      <IconButton
                        size="small"
                        color="secondary"
                        onClick={() => handleOpenAnalyzeDialog(match)}
                        disabled={
                          match.analysis?.aiStatus === "processing" ||
                          match.analysis?.aiStatus === "generated"
                        }
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
          count={filteredMatches.length}
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
              <DateTimePicker
                label="Thời gian thi đấu"
                value={formData.matchDate}
                onChange={(newValue: Date | null) => newValue && setFormData({ ...formData, matchDate: newValue })}
              />
            </LocalizationProvider>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Sân vận động"
                  value={formData.venueName}
                  onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Thành phố"
                  value={formData.venueCity}
                  onChange={(e) => setFormData({ ...formData, venueCity: e.target.value })}
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Vòng đấu"
              value={formData.round}
              onChange={(e) => setFormData({ ...formData, round: e.target.value })}
            />

            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={formData.status}
                label="Trạng thái"
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Match["status"] })}
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editingId ? "Cập nhật" : "Thêm mới"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Analysis Dialog */}
      <Dialog open={openAnalysisDialog} onClose={() => setOpenAnalysisDialog(false)} maxWidth="md" fullWidth>
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
                {selectedMatch.analysis.articles.map((article, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <ArticleIcon />
                    </ListItemIcon>
                    <ListItemText primary={article.title} secondary={article.source} />
                    <Button href={article.url} target="_blank" rel="noopener noreferrer">
                      Xem
                    </Button>
                  </ListItem>
                ))}
              </List>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Phân tích AI
              </Typography>
              <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                <Typography>{selectedMatch.analysis.aiAnalysis.content || "Chưa có phân tích"}</Typography>
                {selectedMatch.analysis.aiAnalysis.generatedAt && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                    Tạo lúc: {new Date(selectedMatch.analysis.aiAnalysis.generatedAt).toLocaleString("vi-VN")}
                  </Typography>
                )}
              </Paper>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Bài viết WordPress
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
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
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAnalysisDialog(false)}>Đóng</Button>
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

      {/* Dialog xác nhận phân tích */}
      <Dialog open={analyzeDialog.open} onClose={handleCloseAnalyzeDialog}>
        <DialogTitle>Xác nhận phân tích trận đấu</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn phân tích trận đấu này?
          </Typography>
          <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: "bold" }}>
            {analyzeDialog.matchName}
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
            disabled={analyzeLoading}
          >
            {analyzeLoading ? "Đang xử lý..." : "Phân tích"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
