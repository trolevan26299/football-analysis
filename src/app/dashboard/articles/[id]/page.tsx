"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Typography,
  Container,
  Paper,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Skeleton,
  Button,
  Link,
} from "@mui/material";
import {
  SportsSoccer as SoccerIcon,
  Link as LinkIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  ArrowBack as ArrowBackIcon
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import ErrorAlert from "@/components/ui/ErrorAlert";

interface ArticleDetail {
  _id: string;
  matchId: string;
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
  referencedArticles: Array<{
    title: string;
    url: string;
    source: string;
    content?: string;
    fetchedAt?: string;
  }>;
  aiAnalysis: {
    content: string;
    generatedAt: string;
    predictedScore?: {
      home: number;
      away: number;
    };
    status: string;
  };
  analysisStatus: string;
  createdAt: string;
  updatedAt: string;
}

export default function ArticleDetailPage({ params }: { params: { id: string } }) {
  const theme = useTheme();
  const router = useRouter();
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticleDetail = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/articles/${params.id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Không tìm thấy bài phân tích");
          }
          throw new Error("Không thể tải bài phân tích");
        }
        
        const data = await response.json();
        setArticle(data);
      } catch (err) {
        console.error("Lỗi khi tải chi tiết bài phân tích:", err);
        setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchArticleDetail();
    }
  }, [params.id]);

  // Format date
  const formatMatchDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "EEEE, dd/MM/yyyy", { locale: vi });
    } catch {
      return dateString;
    }
  };

  // Chuyển đổi dữ liệu sang định dạng hiển thị
  const formatContent = (content: string) => {
    // Chia các đoạn theo dòng mới
    const paragraphs = content.split('\n').filter(p => p.trim() !== '');
    
    return paragraphs.map((paragraph, idx) => {
      // Kiểm tra nếu là tiêu đề
      if (paragraph.startsWith('#') || paragraph.match(/^\d+\./)) {
        return (
          <Typography key={idx} variant="h6" gutterBottom sx={{ mt: 3, fontWeight: 'bold' }}>
            {paragraph.replace(/^#\s*/, '')}
          </Typography>
        );
      }
      
      return (
        <Typography key={idx} paragraph>
          {paragraph}
        </Typography>
      );
    });
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          <Skeleton variant="text" height={60} width="80%" />
          <Skeleton variant="text" height={30} width="40%" sx={{ mb: 2 }} />
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} variant="text" height={20} sx={{ my: 1 }} />
              ))}
            </Grid>
            <Grid item xs={12} md={4}>
              <Skeleton variant="rectangular" height={400} />
            </Grid>
          </Grid>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => router.push('/dashboard/articles')}
            sx={{ mb: 2 }}
          >
            Quay lại danh sách
          </Button>
          <ErrorAlert message={error} />
        </Box>
      </Container>
    );
  }

  if (!article) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          <Typography variant="h5" gutterBottom>
            Không tìm thấy bài phân tích
          </Typography>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => router.push('/dashboard/articles')}
            variant="contained"
          >
            Quay lại danh sách
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => router.push('/dashboard/articles')}
          sx={{ mb: 2 }}
        >
          Quay lại danh sách
        </Button>

        <Paper sx={{ p: 3, mb: 4 }} elevation={2}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h4" gutterBottom>
                {article.matchInfo.homeTeam.name} vs {article.matchInfo.awayTeam.name}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Chip 
                  icon={<SoccerIcon />} 
                  label={article.matchInfo.leagueName} 
                  color="primary" 
                  size="small" 
                />
                <Chip 
                  icon={<CalendarIcon />} 
                  label={formatMatchDate(article.matchInfo.matchDate)} 
                  size="small" 
                  variant="outlined" 
                />
                <Chip 
                  icon={<TimeIcon />} 
                  label={article.matchInfo.kickoffTime} 
                  size="small" 
                  variant="outlined" 
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              {article.aiAnalysis.predictedScore && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Dự đoán tỷ số
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
                  }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2">{article.matchInfo.homeTeam.name}</Typography>
                      <Typography variant="h3">{article.aiAnalysis.predictedScore.home}</Typography>
                    </Box>
                    <Typography variant="h4">-</Typography>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2">{article.matchInfo.awayTeam.name}</Typography>
                      <Typography variant="h3">{article.aiAnalysis.predictedScore.away}</Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }} elevation={1}>
              <Typography variant="h5" gutterBottom sx={{ pb: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
                Phân tích trận đấu
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                {formatContent(article.aiAnalysis.content)}
              </Box>
              
              <Box sx={{ mt: 4, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="caption" color="text.secondary">
                  Được tạo bởi AI vào {format(new Date(article.aiAnalysis.generatedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                </Typography>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 3 }} elevation={1}>
              <Typography variant="h6" gutterBottom sx={{ pb: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
                Bài viết tham khảo
              </Typography>
              
              {article.referencedArticles.length > 0 ? (
                <List dense>
                  {article.referencedArticles.map((source, idx) => (
                    <ListItem key={idx} disablePadding sx={{ mb: 1.5 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <LinkIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={
                          <Link 
                            href={source.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            sx={{ 
                              color: theme.palette.primary.main,
                              textDecoration: 'none',
                              '&:hover': { textDecoration: 'underline' }
                            }}
                          >
                            {source.title}
                          </Link>
                        } 
                        secondary={`Nguồn: ${source.source}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Không có bài viết tham khảo
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
} 