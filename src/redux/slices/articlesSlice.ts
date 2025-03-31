import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Interface cho dữ liệu bài viết
interface Article {
  _id: string;
  title: string;
  matchId: string;
  teams: {
    home: string;
    away: string;
  };
  status: 'draft' | 'published';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  league?: {
    _id: string;
    name: string;
  };
}

// Interface cho pagination data
interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Interface chứa dữ liệu response từ API
interface ArticlesResponse {
  articles: Article[];
  pagination: PaginationData;
}

// Interface cho query parameters
interface ArticlesQueryParams {
  page?: number;
  limit?: number;
  team?: string;
  league?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: string;
}

interface ArticlesState {
  articles: Article[];
  pagination: PaginationData;
  loading: boolean;
  error: string | null;
  currentArticle: Article | null;
  queryParams: ArticlesQueryParams;
}

const initialState: ArticlesState = {
  articles: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
  },
  loading: false,
  error: null,
  currentArticle: null,
  queryParams: {
    page: 1,
    limit: 12,
    sortBy: 'publishedAt',
    sortOrder: 'desc',
  },
};

// Async thunk để fetch articles
export const fetchArticles = createAsyncThunk(
  'articles/fetchArticles',
  async (params: ArticlesQueryParams, { rejectWithValue }) => {
    try {
      // Chuyển đổi params thành query string
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });

      const response = await fetch(`/api/articles?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Không thể tải dữ liệu bài viết');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Đã có lỗi xảy ra');
    }
  }
);

// Async thunk để fetch article detail
export const fetchArticleDetail = createAsyncThunk(
  'articles/fetchArticleDetail',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/articles/${id}`);
      if (!response.ok) {
        throw new Error('Không thể tải chi tiết bài viết');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Đã có lỗi xảy ra');
    }
  }
);

export const articlesSlice = createSlice({
  name: 'articles',
  initialState,
  reducers: {
    // Cập nhật query params
    setQueryParams: (state, action: PayloadAction<Partial<ArticlesQueryParams>>) => {
      state.queryParams = { ...state.queryParams, ...action.payload };
    },
    // Reset query params
    resetQueryParams: (state) => {
      state.queryParams = {
        page: 1,
        limit: 12,
        sortBy: 'publishedAt',
        sortOrder: 'desc',
      };
    },
    // Xóa current article
    clearCurrentArticle: (state) => {
      state.currentArticle = null;
    },
    // Xóa error
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch articles
      .addCase(fetchArticles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArticles.fulfilled, (state, action: PayloadAction<ArticlesResponse>) => {
        state.loading = false;
        state.articles = action.payload.articles;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchArticles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch article detail
      .addCase(fetchArticleDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArticleDetail.fulfilled, (state, action: PayloadAction<Article>) => {
        state.loading = false;
        state.currentArticle = action.payload;
      })
      .addCase(fetchArticleDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  setQueryParams, 
  resetQueryParams, 
  clearCurrentArticle, 
  clearError 
} = articlesSlice.actions;

export default articlesSlice.reducer; 