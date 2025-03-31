/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit';
import { Match, MatchFormData } from '@/types';
import { RootState } from '../store';
import { api } from '../services/rtk-query';

// Match type không có trường id, nhưng EntityAdapter mặc định cần trường id
// Chúng ta đang dùng _id từ MongoDB làm id
// selectId hàm này giúp EntityAdapter xác định trường nào là id
// @ts-expect-error: Bỏ qua lỗi TypeScript vì chúng ta biết _id hoạt động với createEntityAdapter
export const matchesAdapter = createEntityAdapter<Match>({
  selectId: (match) => match._id,
  sortComparer: (a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime()
});

// Định nghĩa state type với các trường bổ sung
interface MatchesState {
  searchTerm: string;
  filterLeague: string;
  filterStatus: string;
  formData: MatchFormData;
  editingId: string | null;
  selectedMatchId: string | null;
  loading: boolean;
  error: string | null;
  success: string | null;
}

// Tạo state ban đầu
const initialState = matchesAdapter.getInitialState<MatchesState>({
  searchTerm: '',
  filterLeague: '',
  filterStatus: '',
  formData: {
    leagueId: '',
    homeTeamName: '',
    awayTeamName: '',
    matchDate: new Date(),
  },
  editingId: null,
  selectedMatchId: null,
  loading: false,
  error: null,
  success: null
});

// Tạo slice
const matchesSlice = createSlice({
  name: 'matches',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setFilterLeague: (state, action: PayloadAction<string>) => {
      state.filterLeague = action.payload;
    },
    setFilterStatus: (state, action: PayloadAction<string>) => {
      state.filterStatus = action.payload;
    },
    updateFormData: (state, action: PayloadAction<Partial<MatchFormData>>) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    resetFormData: (state) => {
      state.formData = initialState.formData;
      state.editingId = null;
    },
    setEditingMatch: (state, action: PayloadAction<string>) => {
      state.editingId = action.payload;
      const match = state.entities[action.payload];
      if (match) {
        state.formData = {
          leagueId: match.leagueId._id,
          homeTeamName: match.homeTeam.name,
          awayTeamName: match.awayTeam.name,
          matchDate: new Date(match.matchDate),
        };
      }
    },
    setSelectedMatch: (state, action: PayloadAction<string | null>) => {
      state.selectedMatchId = action.payload;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Khi data từ getMatches được load
    builder.addMatcher(
      api.endpoints.getMatches.matchFulfilled,
      (state, { payload }) => {
        // Upsert tất cả matches vào state
        matchesAdapter.upsertMany(state, payload.matches);
      }
    );
    
    // Khi một match cụ thể được load
    builder.addMatcher(
      api.endpoints.getMatchById.matchFulfilled,
      (state, { payload }) => {
        matchesAdapter.upsertOne(state, payload);
      }
    );
    
    // Xử lý khi thêm mới một match
    builder.addMatcher(
      api.endpoints.createMatch.matchFulfilled,
      (state, { payload }) => {
        matchesAdapter.addOne(state, payload);
        state.success = 'Thêm trận đấu mới thành công';
      }
    );
    
    // Xử lý khi cập nhật một match
    builder.addMatcher(
      api.endpoints.updateMatch.matchFulfilled,
      (state, { payload }) => {
        matchesAdapter.updateOne(state, { id: payload._id, changes: payload });
        state.success = 'Cập nhật trận đấu thành công';
      }
    );
    
    // Xử lý khi xóa một match
    builder.addMatcher(
      api.endpoints.deleteMatch.matchFulfilled,
      (state, { meta }) => {
        if (meta.arg.originalArgs) {
          matchesAdapter.removeOne(state, meta.arg.originalArgs);
          state.success = 'Xóa trận đấu thành công';
        }
      }
    );
    
    // Xử lý khi có lỗi
    builder.addMatcher(
      api.endpoints.getMatches.matchRejected,
      (state, { error }) => {
        state.error = error.message || 'Lỗi khi tải danh sách trận đấu';
      }
    );
  }
});

// Export actions
export const {
  setSearchTerm,
  setFilterLeague,
  setFilterStatus,
  updateFormData,
  resetFormData,
  setEditingMatch,
  setSelectedMatch,
  clearSuccess,
  clearError
} = matchesSlice.actions;

// Export selectors
export const {
  selectAll: selectAllMatches,
  selectById: selectMatchById,
  selectIds: selectMatchIds,
  selectEntities: selectMatchEntities,
} = matchesAdapter.getSelectors<RootState>((state) => state.matches);

// Customize selectors
export const selectFilteredMatches = (state: RootState) => {
  const matches = selectAllMatches(state);
  const { searchTerm, filterLeague, filterStatus } = state.matches;
  
  return matches.filter(match => {
    const matchesSearch = searchTerm 
      ? (match.homeTeam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         match.awayTeam.name.toLowerCase().includes(searchTerm.toLowerCase()))
      : true;
      
    const matchesLeague = filterLeague 
      ? match.leagueId._id === filterLeague 
      : true;
      
    const matchesStatus = filterStatus 
      ? match.status === filterStatus 
      : true;
      
    return matchesSearch && matchesLeague && matchesStatus;
  });
};

export const selectSelectedMatch = (state: RootState) => {
  const { selectedMatchId } = state.matches;
  return selectedMatchId ? selectMatchById(state, selectedMatchId) : null;
};

// Export reducer
export default matchesSlice.reducer; 