import { createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit';
import { User, UserFormData } from '@/types';
import { RootState } from '../store';
import { api } from '../services/rtk-query';

// Tạo entity adapter cho users với selectId và sortComparer
// @ts-expect-error: Bỏ qua lỗi TypeScript vì chúng ta biết _id hoạt động với createEntityAdapter
export const usersAdapter = createEntityAdapter<User>({
  selectId: (user) => user._id,
  sortComparer: (a, b) => a.username.localeCompare(b.username),
});

// State type với các trường bổ sung
interface UsersState {
  formData: UserFormData;
  editingId: string | null;
  searchTerm: string;
  error: string | null;
  success: string | null;
}

// Tạo state ban đầu
const initialState = usersAdapter.getInitialState<UsersState>({
  formData: {
    username: '',
    password: '',
    fullName: '',
    role: 'ktv',
    status: 'active',
  },
  editingId: null,
  searchTerm: '',
  error: null,
  success: null,
});

// Tạo slice
const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    // Cập nhật form data
    updateFormData: (state, action: PayloadAction<Partial<UserFormData>>) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    
    // Reset form data
    resetFormData: (state) => {
      state.formData = initialState.formData;
      state.editingId = null;
    },
    
    // Thiết lập user để edit
    setEditingUser: (state, action: PayloadAction<string>) => {
      const user = state.entities[action.payload];
      if (user) {
        state.editingId = action.payload;
        state.formData = {
          username: user.username,
          password: '', // Không hiển thị mật khẩu
          fullName: user.fullName,
          role: user.role,
          status: user.status,
        };
      }
    },
    
    // Thiết lập filter và tìm kiếm
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
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
    // Xử lý khi getUsers hoàn thành
    builder.addMatcher(
      api.endpoints.getUsers.matchFulfilled,
      (state, { payload }) => {
        usersAdapter.setAll(state, payload);
      }
    );
    
    // Xử lý khi getUserById hoàn thành
    builder.addMatcher(
      api.endpoints.getUserById.matchFulfilled,
      (state, { payload }) => {
        usersAdapter.upsertOne(state, payload);
      }
    );
    
    // Xử lý khi createUser hoàn thành
    builder.addMatcher(
      api.endpoints.createUser.matchFulfilled,
      (state, { payload }) => {
        usersAdapter.addOne(state, payload);
        state.success = 'Thêm người dùng mới thành công';
      }
    );
    
    // Xử lý khi updateUser hoàn thành
    builder.addMatcher(
      api.endpoints.updateUser.matchFulfilled,
      (state, { payload }) => {
        usersAdapter.updateOne(state, { id: payload._id, changes: payload });
        state.success = 'Cập nhật người dùng thành công';
      }
    );
    
    // Xử lý khi resetPassword hoàn thành
    builder.addMatcher(
      api.endpoints.resetPassword.matchFulfilled,
      (state) => {
        state.success = 'Đặt lại mật khẩu thành công';
      }
    );
    
    // Xử lý khi deleteUser hoàn thành
    builder.addMatcher(
      api.endpoints.deleteUser.matchFulfilled,
      (state, { meta }) => {
        if (meta.arg.originalArgs) {
          usersAdapter.removeOne(state, meta.arg.originalArgs);
          state.success = 'Xóa người dùng thành công';
        }
      }
    );
    
    // Xử lý khi có lỗi
    builder.addMatcher(
      api.endpoints.getUsers.matchRejected,
      (state, { error }) => {
        state.error = error.message || 'Lỗi khi tải danh sách người dùng';
      }
    );
  },
});

// Export actions
export const {
  updateFormData,
  resetFormData,
  setEditingUser,
  setSearchTerm,
  clearSuccess,
  clearError,
} = usersSlice.actions;

// Export selectors
export const {
  selectAll: selectAllUsers,
  selectById: selectUserById,
  selectIds: selectUserIds,
  selectEntities: selectUserEntities,
} = usersAdapter.getSelectors<RootState>((state) => state.users);

// Tạo selector tùy chỉnh để lọc users
export const selectFilteredUsers = (state: RootState) => {
  const users = selectAllUsers(state);
  const { searchTerm } = state.users;
  
  if (!searchTerm) return users;
  
  return users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return user.username.toLowerCase().includes(searchLower) ||
           user.fullName.toLowerCase().includes(searchLower);
  });
};

// Export selector để lấy danh sách các users active
export const selectActiveUsers = (state: RootState) => {
  const users = selectAllUsers(state);
  return users.filter(user => user.status === 'active');
};

// Export reducer
export default usersSlice.reducer; 