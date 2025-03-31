import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Định nghĩa types cho dashboard data
interface DashboardStats {
  totalMatches: number;
  pendingAnalysis: number;
  totalArticles: number;
  totalUsers: number;
  totalLeagues: number;
  activeLeagues: number;
  recentMatches: Array<{
    id: string;
    homeTeam: string;
    awayTeam: string;
    date: string;
    status: string;
  }>;
  recentArticles: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: string;
  }>;
}

interface DashboardState {
  data: DashboardStats | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: DashboardState = {
  data: null,
  loading: false,
  error: null,
  lastFetched: null,
};

// Thunk để fetch dashboard data
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/dashboard');
      if (!response.ok) {
        throw new Error('Không thể tải dữ liệu dashboard');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Đã có lỗi xảy ra');
    }
  }
);

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action: PayloadAction<DashboardStats>) => {
        state.loading = false;
        state.data = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearDashboardError } = dashboardSlice.actions;

export default dashboardSlice.reducer; 