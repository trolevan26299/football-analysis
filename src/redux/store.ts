import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from './services/rtk-query';

// Import reducers
import dashboardReducer from './slices/dashboardSlice';
import matchesReducer from './slices/matchesSlice';
import usersReducer from './slices/usersSlice';
import leaguesReducer from './slices/leaguesSlice';
import articlesReducer from './slices/articlesSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    matches: matchesReducer,
    users: usersReducer,
    leagues: leaguesReducer,
    articles: articlesReducer,
    ui: uiReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

// Optional: Cần thiết cho refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 