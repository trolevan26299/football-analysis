import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Interface cho dữ liệu giải đấu
interface League {
  _id: string;
  name: string;
  country: string;
  season: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

// Interface cho form data
interface LeagueFormData {
  name: string;
  country: string;
  season: string;
  status: 'active' | 'inactive';
}

interface LeaguesState {
  leagues: League[];
  filteredLeagues: League[];
  loading: boolean;
  error: string | null;
  formData: LeagueFormData;
  editingId: string | null;
  searchTerm: string;
  showInactiveLeagues: boolean;
  success: string | null;
}

const initialFormData: LeagueFormData = {
  name: '',
  country: '',
  season: new Date().getFullYear().toString(),
  status: 'active',
};

const initialState: LeaguesState = {
  leagues: [],
  filteredLeagues: [],
  loading: false,
  error: null,
  formData: initialFormData,
  editingId: null,
  searchTerm: '',
  showInactiveLeagues: false,
  success: null,
};

// Async thunk để fetch leagues
export const fetchLeagues = createAsyncThunk(
  'leagues/fetchLeagues',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/leagues');
      if (!response.ok) {
        throw new Error('Không thể tải dữ liệu giải đấu');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Đã có lỗi xảy ra');
    }
  }
);

// Async thunk để thêm league mới
export const addLeague = createAsyncThunk(
  'leagues/addLeague',
  async (formData: LeagueFormData, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/leagues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Không thể thêm giải đấu');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Đã có lỗi xảy ra');
    }
  }
);

// Async thunk để update league
export const updateLeague = createAsyncThunk(
  'leagues/updateLeague',
  async ({ id, formData }: { id: string; formData: LeagueFormData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/leagues/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Không thể cập nhật giải đấu');
      }

      const data = await response.json();
      return { id, data };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Đã có lỗi xảy ra');
    }
  }
);

// Async thunk để thay đổi status
export const toggleLeagueStatus = createAsyncThunk(
  'leagues/toggleStatus',
  async (id: string, { getState, rejectWithValue }) => {
    try {
      // Lấy league hiện tại
      const state = getState() as { leagues: LeaguesState };
      const league = state.leagues.leagues.find((l) => l._id === id);
      
      if (!league) {
        throw new Error('Không tìm thấy giải đấu');
      }
      
      // Đảo ngược trạng thái
      const newStatus = league.status === 'active' ? 'inactive' : 'active';
      
      const response = await fetch(`/api/leagues/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Không thể cập nhật trạng thái giải đấu');
      }

      const data = await response.json();
      return { id, data };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Đã có lỗi xảy ra');
    }
  }
);

// Async thunk để xóa league
export const deleteLeague = createAsyncThunk(
  'leagues/deleteLeague',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/leagues/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Không thể xóa giải đấu');
      }

      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Đã có lỗi xảy ra');
    }
  }
);

export const leaguesSlice = createSlice({
  name: 'leagues',
  initialState,
  reducers: {
    // Cập nhật form data
    updateFormData: (state, action: PayloadAction<Partial<LeagueFormData>>) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    // Reset form data
    resetFormData: (state) => {
      state.formData = initialFormData;
      state.editingId = null;
    },
    // Thiết lập league để edit
    setEditingLeague: (state, action: PayloadAction<string>) => {
      const league = state.leagues.find((l) => l._id === action.payload);
      if (league) {
        state.editingId = action.payload;
        state.formData = {
          name: league.name,
          country: league.country,
          season: league.season,
          status: league.status,
        };
      }
    },
    // Thiết lập filter và tìm kiếm
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      state.filteredLeagues = filterLeagues(state);
    },
    setShowInactiveLeagues: (state, action: PayloadAction<boolean>) => {
      state.showInactiveLeagues = action.payload;
      state.filteredLeagues = filterLeagues(state);
    },
    // Xóa thông báo
    clearSuccess: (state) => {
      state.success = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch leagues
      .addCase(fetchLeagues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeagues.fulfilled, (state, action: PayloadAction<League[]>) => {
        state.loading = false;
        state.leagues = action.payload;
        state.filteredLeagues = filterLeagues({ ...state, leagues: action.payload });
      })
      .addCase(fetchLeagues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add league
      .addCase(addLeague.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addLeague.fulfilled, (state, action: PayloadAction<League>) => {
        state.loading = false;
        state.leagues.push(action.payload);
        state.filteredLeagues = filterLeagues(state);
        state.success = 'Thêm giải đấu mới thành công';
        state.formData = initialFormData;
      })
      .addCase(addLeague.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update league
      .addCase(updateLeague.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLeague.fulfilled, (state, action) => {
        state.loading = false;
        const { id, data } = action.payload as { id: string; data: League };
        const index = state.leagues.findIndex((l) => l._id === id);
        if (index !== -1) {
          state.leagues[index] = data;
        }
        state.filteredLeagues = filterLeagues(state);
        state.success = 'Cập nhật giải đấu thành công';
        state.formData = initialFormData;
        state.editingId = null;
      })
      .addCase(updateLeague.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Toggle status
      .addCase(toggleLeagueStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleLeagueStatus.fulfilled, (state, action) => {
        state.loading = false;
        const { id, data } = action.payload as { id: string; data: League };
        const index = state.leagues.findIndex((l) => l._id === id);
        if (index !== -1) {
          state.leagues[index] = data;
        }
        state.filteredLeagues = filterLeagues(state);
        state.success = 'Cập nhật trạng thái giải đấu thành công';
      })
      .addCase(toggleLeagueStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete league
      .addCase(deleteLeague.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLeague.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.leagues = state.leagues.filter((l) => l._id !== action.payload);
        state.filteredLeagues = filterLeagues(state);
        state.success = 'Xóa giải đấu thành công';
      })
      .addCase(deleteLeague.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Helper function để filter leagues dựa trên các tiêu chí
function filterLeagues(state: LeaguesState): League[] {
  return state.leagues.filter((league) => {
    const matchesSearch =
      league.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
      league.country.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
      league.season.toLowerCase().includes(state.searchTerm.toLowerCase());

    const matchesStatus = state.showInactiveLeagues || league.status === 'active';

    return matchesSearch && matchesStatus;
  });
}

export const {
  updateFormData,
  resetFormData,
  setEditingLeague,
  setSearchTerm,
  setShowInactiveLeagues,
  clearSuccess,
  clearError,
} = leaguesSlice.actions;

export default leaguesSlice.reducer; 