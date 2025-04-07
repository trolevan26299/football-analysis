"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Chip,
  Skeleton,
  Container,
  Paper,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Button,
  IconButton,
  Tooltip,
  useMediaQuery,
  Menu,
  ListItemIcon,
  ListItemText,
  alpha
} from "@mui/material";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import ErrorAlert from "@/components/ui/ErrorAlert";
import { 
  Search as SearchIcon, 
  Sort as SortIcon, 
  CalendarMonth as CalendarIcon,
  AccessTime as TimeIcon,
  SportsSoccer as SportsSoccerIcon,
  EmojiEvents as TrophyIcon,
  Clear as ClearIcon,
  KeyboardArrowDown as ArrowDownIcon,
  GridView as GridViewIcon,
  ViewList as ListViewIcon
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { viVN } from "@mui/x-date-pickers/locales";

interface Article {
  _id: string;
  matchInfo: {
    homeTeam: {
      name: string;
      logo: string;
    };
    awayTeam: {
      name: string;
      logo: string;
    };
    matchDate: string;
    kickoffTime: string;
    leagueId: string;
    leagueName: string;
    leagueLogo?: string;
  };
  aiAnalysis: {
    content: string;
    generatedAt: string;
    predictedScore?: {
      home: number;
      away: number;
    };
  };
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ApiResponse {
  articles: Article[];
  pagination: PaginationData;
  filters: {
    leagues: string[];
  };
}

// Hỗ trợ các kiểu hiển thị
type ViewMode = 'grid' | 'list';

export default function ArticlesPage() {
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State cho dữ liệu và trạng thái tải
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State cho phân trang
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  
  // State cho bộ lọc
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLeague, setSelectedLeague] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [sortBy, setSortBy] = useState<string>("matchDate");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  
  // State cho UI/UX
  const [anchorElSort, setAnchorElSort] = useState<null | HTMLElement>(null);

  // Xây dựng URL với các tham số tìm kiếm
  const buildQueryString = (params: Record<string, string | number | null | undefined>) => {
    const urlParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        urlParams.append(key, String(value));
      }
    });
    
    return urlParams.toString();
  };
  
  // Effect để fetch dữ liệu với bộ lọc
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        
        // Tạo query string từ các tham số
        const queryParams = buildQueryString({
          page,
          limit,
          team: searchTerm,
          league: selectedLeague,
          dateFrom: dateFrom ? format(dateFrom, 'yyyy-MM-dd') : null,
          dateTo: dateTo ? format(dateTo, 'yyyy-MM-dd') : null,
          sortBy,
          sortOrder
        });
        
        const response = await fetch(`/api/articles?${queryParams}`);
        
        if (!response.ok) {
          throw new Error("Không thể tải danh sách bài phân tích");
        }
        
        const data: ApiResponse = await response.json();
        setData(data);
      } catch (err) {
        console.error("Lỗi khi tải bài phân tích:", err);
        setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [page, limit, selectedLeague, dateFrom, dateTo, sortBy, sortOrder, searchTerm]);

  // Hàm xử lý đổi trang
  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    // Cuộn lên đầu trang khi chuyển trang
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Hàm xử lý reset bộ lọc
  const handleResetFilters = () => {
    setSelectedLeague("");
    setDateFrom(null);
    setDateTo(null);
    setSortBy("matchDate");
    setSortOrder("desc");
    setSearchTerm("");
    setPage(1);
  };
  
  // Hàm xử lý thay đổi chế độ xem
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };
  
  // Hàm xử lý mở menu sắp xếp
  const handleOpenSortMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElSort(event.currentTarget);
  };
  
  // Hàm xử lý đóng menu sắp xếp
  const handleCloseSortMenu = () => {
    setAnchorElSort(null);
  };
  
  // Hàm xử lý thay đổi sắp xếp
  const handleSortChange = (sortField: string, order: string) => {
    setSortBy(sortField);
    setSortOrder(order);
    setAnchorElSort(null);
  };
  
  // Hàm chuyển sang trang chi tiết
  const handleArticleClick = (id: string) => {
    router.push(`/dashboard/articles/${id}`);
  };

  // Format date
  const formatMatchDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy HH:mm", { locale: vi });
    } catch {
      return dateString;
    }
  };

  // Trích xuất nội dung tóm tắt
  const getSummary = (content: string) => {
    return content.substring(0, viewMode === 'list' ? 250 : 150) + "...";
  };
  
  // Hiển thị tên tùy chọn sắp xếp
  const getSortDisplay = (sortBy: string, sortOrder: string) => {
    const orderText = sortOrder === "asc" ? "tăng dần" : "giảm dần";
    switch (sortBy) {
      case "matchDate": return `Ngày trận đấu (${orderText})`;
      case "createdAt": return `Ngày tạo (${orderText})`;
      case "leagueName": return `Giải đấu (${orderText})`;
      default: return `Ngày trận đấu (${orderText})`;
    }
  };

  return (
    <LocalizationProvider 
      dateAdapter={AdapterDateFns} 
      adapterLocale={vi}
      localeText={viVN.components.MuiLocalizationProvider.defaultProps.localeText}
    >
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          {/* Header section */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              mb: 4, 
              borderRadius: 2,
              background: theme => theme.palette.mode === 'dark' 
                ? `linear-gradient(135deg, ${alpha('#1e293b', 0.95)}, ${alpha('#0f172a', 0.9)})`
                : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.15)}, ${alpha(theme.palette.primary.main, 0.08)})`,
              boxShadow: theme.palette.mode === 'dark'
                ? `0 10px 15px -3px ${alpha('#000', 0.3)}, 0 4px 6px -4px ${alpha('#000', 0.4)}`
                : `0 10px 15px -3px ${alpha(theme.palette.primary.main, 0.1)}, 0 4px 6px -4px ${alpha(theme.palette.primary.main, 0.06)}`,
              border: `1px solid ${
                theme.palette.mode === 'dark'
                  ? alpha('#ffffff', 0.05)
                  : alpha(theme.palette.primary.main, 0.1)
              }`,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Tạo hiệu ứng gradient dots */}
            <Box 
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                opacity: 0.3,
                pointerEvents: 'none',
                zIndex: 0
              }}
            />

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: { xs: 'flex-start', sm: 'center' }, 
              flexDirection: { xs: 'column', sm: 'row' },
              mb: 3,
              position: 'relative',
              zIndex: 1
            }}>
              <Box sx={{ mb: { xs: 2, sm: 0 } }}>
                <Typography 
                  variant="h4" 
                  component="h1"
                  sx={{ 
                    fontWeight: 700, 
                    color: theme.palette.mode === "dark" ? "white" : theme.palette.primary.dark,
                    mb: 0.5
                  }}
                >
                  Bài viết phân tích
                </Typography>
                <Typography 
                  variant="subtitle1" 
                  color={theme.palette.mode === "dark" ? "grey.300" : "text.secondary"}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <SportsSoccerIcon fontSize="small" />
                  Phân tích chuyên sâu các trận đấu bóng đá
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Chế độ xem lưới">
                  <IconButton
                    color={viewMode === 'grid' ? 'primary' : 'default'}
                    onClick={() => handleViewModeChange('grid')}
                    sx={{ 
                      bgcolor: viewMode === 'grid' 
                        ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.1) 
                        : theme.palette.mode === 'dark' ? alpha('#fff', 0.05) : alpha('#000', 0.03),
                      '&:hover': {
                        bgcolor: viewMode === 'grid'
                          ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.3 : 0.2)
                          : theme.palette.mode === 'dark' ? alpha('#fff', 0.1) : alpha('#000', 0.05),
                      }
                    }}
                  >
                    <GridViewIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Chế độ xem danh sách">
                  <IconButton
                    color={viewMode === 'list' ? 'primary' : 'default'}
                    onClick={() => handleViewModeChange('list')}
                    sx={{ 
                      bgcolor: viewMode === 'list' 
                        ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.1) 
                        : theme.palette.mode === 'dark' ? alpha('#fff', 0.05) : alpha('#000', 0.03),
                      '&:hover': {
                        bgcolor: viewMode === 'list'
                          ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.3 : 0.2)
                          : theme.palette.mode === 'dark' ? alpha('#fff', 0.1) : alpha('#000', 0.05),
                      }
                    }}
                  >
                    <ListViewIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            {/* Thanh tìm kiếm và bộ lọc */}
            <Box 
              sx={{ 
                display: 'grid', 
                gridTemplateColumns: { 
                  xs: '1fr', 
                  sm: '1fr 1fr', 
                  md: '1fr 1fr 1fr 1fr auto auto'
                },
                gap: 2
              }}
            >
              <TextField
                placeholder="Tìm đội bóng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  )
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: 2
                  }
                }}
                size="small"
                fullWidth
              />

              <DatePicker 
                label="Từ ngày"
                value={dateFrom}
                onChange={(newValue) => setDateFrom(newValue)}
                slotProps={{ 
                  textField: { 
                    size: 'small',
                    fullWidth: true,
                    sx: { 
                      backgroundColor: theme.palette.background.paper,
                      borderRadius: 2
                    } 
                  } 
                }}
              />
              
              <DatePicker 
                label="Đến ngày"
                value={dateTo}
                onChange={(newValue) => setDateTo(newValue)}
                slotProps={{ 
                  textField: { 
                    size: 'small',
                    fullWidth: true,
                    sx: { 
                      backgroundColor: theme.palette.background.paper,
                      borderRadius: 2
                    } 
                  } 
                }}
              />

              <FormControl 
                size="small" 
                sx={{ 
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: 2
                }}
                fullWidth
              >
                <InputLabel id="league-select-label">Giải đấu</InputLabel>
                <Select
                  labelId="league-select-label"
                  value={selectedLeague}
                  label="Giải đấu"
                  onChange={(e) => setSelectedLeague(e.target.value)}
                >
                  <MenuItem value="">Tất cả giải đấu</MenuItem>
                  {data?.filters.leagues.map((league) => (
                    <MenuItem key={league} value={league}>
                      {league}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Button 
                aria-haspopup="true" 
                onClick={handleOpenSortMenu}
                variant="outlined"
                startIcon={<SortIcon />}
                endIcon={<ArrowDownIcon fontSize="small" />}
                size="small"
                sx={{ 
                  bgcolor: theme.palette.background.paper,
                  height: '40px'
                }}
                fullWidth
              >
                {sortBy === "matchDate" ? "Sắp xếp" : getSortDisplay(sortBy, sortOrder)}
              </Button>
              
              {(selectedLeague || dateFrom || dateTo || sortBy !== "matchDate" || sortOrder !== "desc" || searchTerm) && (
                <Button 
                  variant="outlined"
                  color="error"
                  onClick={handleResetFilters}
                  startIcon={<ClearIcon />}
                  size="small"
                  sx={{ height: '40px' }}
                  fullWidth
                >
                  Xóa lọc
                </Button>
              )}
            </Box>

            {/* Thêm dòng hiển thị số lượng bài viết được tìm thấy với thiết kế đẹp hơn */}
            {data && !loading && (
              <Box 
                sx={{ 
                  mt: 2, 
                  p: 1.5, 
                  borderRadius: 2, 
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SportsSoccerIcon fontSize="small" color="primary" />
                  Tìm thấy <strong>{data.pagination.total}</strong> bài phân tích
                </Typography>
                {data.pagination.totalPages > 1 && (
                  <Typography variant="body2" color="text.secondary">
                    Trang {data.pagination.page}/{data.pagination.totalPages}
                  </Typography>
                )}
              </Box>
            )}
          </Paper>
          
          <Menu
            anchorEl={anchorElSort}
            open={Boolean(anchorElSort)}
            onClose={handleCloseSortMenu}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              elevation: 3,
              sx: {
                borderRadius: '12px',
                mt: 1,
                boxShadow: theme.shadows[3],
                minWidth: 220
              }
            }}
          >
            <MenuItem onClick={() => handleSortChange('matchDate', 'desc')}>
              <ListItemIcon>
                <CalendarIcon fontSize="small" color={sortBy === 'matchDate' && sortOrder === 'desc' ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText>Trận đấu mới nhất</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleSortChange('matchDate', 'asc')}>
              <ListItemIcon>
                <CalendarIcon fontSize="small" color={sortBy === 'matchDate' && sortOrder === 'asc' ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText>Trận đấu cũ nhất</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleSortChange('createdAt', 'desc')}>
              <ListItemIcon>
                <TimeIcon fontSize="small" color={sortBy === 'createdAt' && sortOrder === 'desc' ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText>Phân tích mới nhất</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleSortChange('leagueName', 'asc')}>
              <ListItemIcon>
                <TrophyIcon fontSize="small" color={sortBy === 'leagueName' && sortOrder === 'asc' ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText>Giải đấu (A-Z)</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleSortChange('leagueName', 'desc')}>
              <ListItemIcon>
                <TrophyIcon fontSize="small" color={sortBy === 'leagueName' && sortOrder === 'desc' ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText>Giải đấu (Z-A)</ListItemText>
            </MenuItem>
          </Menu>

          {error && <ErrorAlert message={error} />}

          {/* Hiển thị skeleton khi đang tải */}
          {loading ? (
            <Grid container spacing={3}>
              {Array.from(new Array(limit)).map((_, index) => (
                <Grid item xs={12} sm={viewMode === 'list' ? 12 : 6} md={viewMode === 'list' ? 12 : 4} lg={viewMode === 'list' ? 12 : 3} key={index}>
                  <Card sx={{ 
                    display: 'flex', 
                    flexDirection: viewMode === 'list' ? 'row' : 'column',
                    height: viewMode === 'list' ? 200 : 'auto',
                    borderRadius: 2
                  }}>
                    <Skeleton 
                      variant="rectangular" 
                      height={viewMode === 'list' ? 200 : 140}
                      width={viewMode === 'list' ? 200 : '100%'}
                      sx={{ borderRadius: viewMode === 'list' ? '8px 0 0 8px' : '8px 8px 0 0' }}
                    />
                    <CardContent sx={{ flex: 1, p: 2 }}>
                      <Skeleton variant="text" height={30} />
                      <Skeleton variant="text" />
                      <Skeleton variant="text" width="60%" />
                      <Skeleton variant="text" />
                      {viewMode === 'list' && (
                        <>
                          <Skeleton variant="text" />
                          <Skeleton variant="text" />
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <>
              {/* Hiển thị khi không có kết quả */}
              {data && data.articles.length === 0 ? (
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 4, 
                    textAlign: 'center', 
                    backgroundColor: alpha(theme.palette.background.paper, 0.7),
                    borderRadius: 2,
                    border: `1px dashed ${alpha(theme.palette.divider, 0.2)}`
                  }}
                >
                  <SportsSoccerIcon sx={{ fontSize: 60, color: alpha(theme.palette.text.secondary, 0.2), mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Không tìm thấy bài phân tích
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Không có bài phân tích nào phù hợp với điều kiện tìm kiếm của bạn.
                  </Typography>
                  <Button 
                    variant="outlined"
                    onClick={handleResetFilters}
                    startIcon={<ClearIcon />}
                  >
                    Xóa bộ lọc
                  </Button>
                </Paper>
              ) : (
                // Hiển thị danh sách bài viết
                <>
                  <Grid container spacing={3}>
                    {data?.articles.map((article) => (
                      <Grid item xs={12} sm={viewMode === 'list' ? 12 : 6} md={viewMode === 'list' ? 12 : 4} lg={viewMode === 'list' ? 12 : 3} key={article._id}>
                        <Card 
                          sx={{ 
                            height: "100%", 
                            display: "flex", 
                            flexDirection: viewMode === 'list' ? "row" : "column",
                            bgcolor: theme.palette.mode === "dark" ? alpha("#1e1e1e", 0.7) : theme.palette.background.paper,
                            overflow: 'hidden',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            borderRadius: 2,
                            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                            '&:hover': {
                              transform: 'translateY(-8px)',
                              boxShadow: theme.shadows[10],
                              borderColor: alpha(theme.palette.primary.main, 0.2),
                              '& .MuiCardMedia-root': {
                                transform: 'scale(1.08)',
                              }
                            }
                          }}
                          elevation={1}
                        >
                          <CardActionArea 
                            onClick={() => handleArticleClick(article._id)}
                            sx={{ 
                              display: 'flex', 
                              flexDirection: viewMode === 'list' ? 'row' : 'column',
                              alignItems: 'stretch',
                              height: '100%',
                              width: '100%',
                              '& .MuiCardActionArea-focusHighlight': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.1)
                              }
                            }}
                          >
                            <Box
                              sx={{
                                position: 'relative',
                                width: viewMode === 'list' ? 200 : '100%',
                                height: viewMode === 'list' ? '100%' : 180,
                                overflow: 'hidden',
                                borderRight: viewMode === 'list' ? `1px solid ${alpha(theme.palette.divider, 0.1)}` : 'none',
                                borderRadius: viewMode === 'list' ? '8px 0 0 8px' : '8px 8px 0 0'
                              }}
                            >
                              <CardMedia
                                component="img"
                                height="100%"
                                image={article.matchInfo.leagueLogo || "/images/default-match.jpg"}
                                alt={`${article.matchInfo.homeTeam.name} vs ${article.matchInfo.awayTeam.name}`}
                                sx={{ 
                                  objectFit: "cover",
                                  width: '100%',
                                  transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                                }}
                              />
                              {/* Overlay gradient trên hình ảnh */}
                              <Box sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                background: viewMode === 'list' 
                                  ? `linear-gradient(90deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)`
                                  : `linear-gradient(0deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0) 100%)`,
                                opacity: 0.7,
                                transition: 'opacity 0.3s ease',
                                zIndex: 1
                              }} />
                            </Box>
                            <CardContent sx={{ 
                              flex: 1, 
                              display: 'flex', 
                              flexDirection: 'column',
                              p: 2.5,
                              "&:last-child": { paddingBottom: 2.5 } 
                            }}>
                              <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Chip 
                                  label={article.matchInfo.leagueName} 
                                  size="small" 
                                  color="primary"
                                  sx={{ 
                                    borderRadius: '4px',
                                    fontWeight: 500,
                                    fontSize: '0.75rem',
                                    height: 24,
                                    boxShadow: theme.shadows[1]
                                  }}
                                />
                                <Typography 
                                  variant="caption" 
                                  color="text.secondary"
                                  sx={{
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: '4px',
                                    bgcolor: alpha(theme.palette.background.default, 0.5),
                                  }}
                                >
                                  <CalendarIcon fontSize="inherit" />
                                  {formatMatchDate(article.matchInfo.matchDate)}
                                </Typography>
                              </Box>
                              
                              <Typography 
                                variant="h6" 
                                component="div" 
                                sx={{ 
                                  fontWeight: 600, 
                                  mb: 1.5,
                                  fontSize: viewMode === 'list' ? '1.2rem' : '1rem',
                                  lineHeight: 1.3,
                                  color: theme.palette.mode === 'dark' 
                                    ? alpha(theme.palette.common.white, 0.95) 
                                    : theme.palette.text.primary
                                }}
                              >
                                {article.matchInfo.homeTeam.name} vs {article.matchInfo.awayTeam.name}
                              </Typography>
                              
                              {/* Hiển thị dự đoán tỷ số nếu có */}
                              {article.aiAnalysis.predictedScore && (
                                <Box 
                                  sx={{ 
                                    display: "flex", 
                                    alignItems: "center",
                                    my: 1.5,
                                    p: 1.2,
                                    bgcolor: theme.palette.mode === "dark" 
                                      ? alpha("#ffffff", 0.08) 
                                      : alpha(theme.palette.primary.light, 0.08),
                                    borderRadius: 1.5,
                                    alignSelf: 'flex-start',
                                    border: `1px solid ${
                                      theme.palette.mode === "dark" 
                                        ? alpha("#ffffff", 0.1) 
                                        : alpha(theme.palette.primary.main, 0.15)
                                    }`,
                                  }}
                                >
                                  <Typography 
                                    variant="body2" 
                                    fontWeight="600"
                                    sx={{ 
                                      display: 'flex', 
                                      alignItems: 'center',
                                      gap: 0.8,
                                      color: theme.palette.mode === 'dark' 
                                        ? alpha('#fff', 0.9) 
                                        : theme.palette.primary.dark
                                    }}
                                  >
                                    <SportsSoccerIcon fontSize="small" />
                                    Dự đoán: {article.aiAnalysis.predictedScore.home} - {article.aiAnalysis.predictedScore.away}
                                  </Typography>
                                </Box>
                              )}
                              
                              <Typography 
                                variant="body2" 
                                color="text.secondary" 
                                sx={{ 
                                  mt: 'auto',
                                  display: '-webkit-box',
                                  WebkitLineClamp: viewMode === 'list' ? 3 : 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  lineHeight: 1.6,
                                  fontSize: '0.9rem',
                                  opacity: 0.85
                                }}
                              >
                                {getSummary(article.aiAnalysis.content)}
                              </Typography>
                            </CardContent>
                          </CardActionArea>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                  
                  {/* Phân trang */}
                  {data && data.pagination.totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5, mb: 2 }}>
                      <Pagination 
                        count={data.pagination.totalPages} 
                        page={page} 
                        onChange={handlePageChange}
                        color="primary"
                        size={isMobile ? "small" : "medium"}
                        siblingCount={isMobile ? 0 : 1}
                        boundaryCount={isMobile ? 1 : 2}
                        shape="rounded"
                        sx={{
                          '& .MuiPaginationItem-root': {
                            fontWeight: 500,
                            '&.Mui-selected': {
                              fontWeight: 700,
                              boxShadow: theme.shadows[2]
                            }
                          }
                        }}
                      />
                    </Box>
                  )}
                </>
              )}
            </>
          )}
        </Box>
      </Container>
    </LocalizationProvider>
  );
} 