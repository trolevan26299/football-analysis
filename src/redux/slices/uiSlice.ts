import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  // App loading state
  isRouteChanging: boolean;
  isSidebarOpen: boolean;
  isDarkMode: boolean;
  successMessages: string[];
  errorMessages: string[];
}

const initialState: UIState = {
  isRouteChanging: false,
  isSidebarOpen: true,
  isDarkMode: false,
  successMessages: [],
  errorMessages: [],
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setIsRouteChanging: (state, action: PayloadAction<boolean>) => {
      state.isRouteChanging = action.payload;
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isSidebarOpen = action.payload;
    },
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
    },
    addSuccessMessage: (state, action: PayloadAction<string>) => {
      state.successMessages.push(action.payload);
    },
    removeSuccessMessage: (state, action: PayloadAction<number>) => {
      state.successMessages = state.successMessages.filter((_, index) => index !== action.payload);
    },
    clearSuccessMessages: (state) => {
      state.successMessages = [];
    },
    addErrorMessage: (state, action: PayloadAction<string>) => {
      state.errorMessages.push(action.payload);
    },
    removeErrorMessage: (state, action: PayloadAction<number>) => {
      state.errorMessages = state.errorMessages.filter((_, index) => index !== action.payload);
    },
    clearErrorMessages: (state) => {
      state.errorMessages = [];
    },
  },
});

export const {
  setIsRouteChanging,
  toggleSidebar,
  setSidebarOpen,
  toggleDarkMode,
  setDarkMode,
  addSuccessMessage,
  removeSuccessMessage,
  clearSuccessMessages,
  addErrorMessage,
  removeErrorMessage,
  clearErrorMessages,
} = uiSlice.actions;

export default uiSlice.reducer; 