/* eslint-disable @typescript-eslint/no-unused-vars */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setupListeners } from '@reduxjs/toolkit/query';
import type { AppDispatch } from '../store';
import {
  User,
  Match,
  Article,
  League,
  MatchesResponse,
  ArticlesResponse,
  MatchRequest,
  ArticleRequest,
  DashboardStats
} from '@/types';

// Định nghĩa baseQuery với config mở rộng
const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers) => {
    // Thêm headers mặc định nếu cần thiết
    headers.set('Content-Type', 'application/json');
    
    // Thêm authorization nếu có token
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  },
  // Xử lý lỗi một cách nhất quán
  responseHandler: async (response) => {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      return Promise.reject(error);
    }
    return response.json();
  }
});

// Cập nhật lại kiểu dữ liệu cho tạo match mới
interface CreateMatchRequest {
  leagueId: string;
  homeTeamName: string;
  awayTeamName: string;
  matchDate: string;
  status?: string; // Thêm trường status (tùy chọn)
}

// Cập nhật lại kiểu dữ liệu cho cập nhật match
interface UpdateMatchRequest {
  id: string;
  leagueId?: string;
  homeTeamName?: string;
  awayTeamName?: string;
  matchDate?: string;
  status?: string; // Thêm trường status (tùy chọn)
}

// API định nghĩa
export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  // Enable refetchOnFocus và refetchOnReconnect
  keepUnusedDataFor: 60, // Default TTL là 60 giây
  refetchOnFocus: true,
  refetchOnReconnect: true,
  refetchOnMountOrArgChange: 300, // Refetch sau 5 phút nếu component được mount lại
  tagTypes: ['Matches', 'Articles', 'Leagues', 'Users', 'Dashboard'],
  endpoints: (builder) => ({
    // Dashboard endpoints
    getDashboard: builder.query<DashboardStats, void>({
      query: () => '/dashboard',
      providesTags: ['Dashboard'],
      keepUnusedDataFor: 300, // Giữ cache trong 5 phút
      transformResponse: (response: DashboardStats) => {
        // Đảm bảo dữ liệu trả về đúng định dạng
        return {
          ...response,
          recentMatches: response.recentMatches || [],
          recentArticles: response.recentArticles || [],
        };
      },
    }),

    // Matches endpoints
    getMatches: builder.query<MatchesResponse, MatchRequest>({
      query: (params) => {
        // Chuyển đổi params thành query string
        const queryParams = new URLSearchParams();
        Object.entries(params || {}).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, String(value));
          }
        });
        return { url: `/admin/matches?${queryParams.toString()}` };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.matches.map(({ _id }) => ({ type: 'Matches' as const, id: _id })),
              { type: 'Matches' as const, id: 'LIST' },
            ]
          : [{ type: 'Matches' as const, id: 'LIST' }],
      keepUnusedDataFor: 120, // Giữ cache trong 2 phút
      // Đảm bảo cấu trúc dữ liệu nhất quán cho cache và state
      transformResponse: (response: unknown): MatchesResponse => {
        // Kiểm tra xem response có phải là mảng không (API cũ có thể trả về mảng matches trực tiếp)
        if (Array.isArray(response)) {
          const matches = response.map(match => normalizeMatch(match));
          return {
            matches,
            pagination: {
              total: matches.length,
              page: 1,
              limit: matches.length,
              totalPages: 1
            }
          };
        }
        
        // Trường hợp response là đối tượng có matches và pagination
        if (response && typeof response === 'object' && 'matches' in response && Array.isArray(response.matches)) {
          // Sử dụng type assertion để tạo paginationData
          type PaginationLike = { total?: number; page?: number; limit?: number; totalPages?: number };
          
          let paginationData: PaginationLike;
          
          if ('pagination' in response && 
              typeof response.pagination === 'object' && 
              response.pagination !== null) {
            // Đảm bảo đối tượng pagination có đủ các trường cần thiết
            paginationData = {
              total: typeof (response.pagination as PaginationLike).total === 'number' 
                ? (response.pagination as PaginationLike).total
                : response.matches.length,
              page: typeof (response.pagination as PaginationLike).page === 'number' 
                ? (response.pagination as PaginationLike).page
                : 1,
              limit: typeof (response.pagination as PaginationLike).limit === 'number' 
                ? (response.pagination as PaginationLike).limit
                : response.matches.length,
              totalPages: typeof (response.pagination as PaginationLike).totalPages === 'number' 
                ? (response.pagination as PaginationLike).totalPages
                : 1
            };
          } else {
            paginationData = {
              total: response.matches.length,
              page: 1,
              limit: response.matches.length,
              totalPages: 1
            };
          }
            
          // Đảm bảo paginationData có đủ các trường cần thiết
          return {
            matches: response.matches.map(match => normalizeMatch(match)),
            pagination: {
              total: paginationData.total ?? 0,
              page: paginationData.page ?? 1,
              limit: paginationData.limit ?? 10,
              totalPages: paginationData.totalPages ?? 1
            }
          };
        }
        
        // Fallback: Tạo cấu trúc mặc định
        return {
          matches: [],
          pagination: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0
          }
        };
      },
    }),

    getMatchById: builder.query<Match, string>({
      query: (id) => `/matches/${id}`,
      providesTags: (result, error, id) => [{ type: 'Matches' as const, id }],
      keepUnusedDataFor: 300, // Giữ cache trong 5 phút
    }),

    // Endpoint cho việc tạo trận đấu
    createMatch: builder.mutation<Match, CreateMatchRequest>({
      query: (body) => ({
        url: '/matches',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Matches'],
    }),

    // Endpoint cho việc cập nhật trận đấu
    updateMatch: builder.mutation<Match, UpdateMatchRequest>({
      query: ({ id, ...body }) => ({
        url: `/matches/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Matches', id },
        'Matches',
      ],
    }),

    deleteMatch: builder.mutation<void, string>({
      query: (id) => ({
        url: `/matches/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Matches', id: 'LIST' }, 'Dashboard'],
    }),

    // Articles endpoints với infinite scrolling
    getArticles: builder.query<ArticlesResponse, ArticleRequest>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        Object.entries(params || {}).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, String(value));
          }
        });
        return { url: `/articles?${queryParams.toString()}` };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.articles.map(({ _id }) => ({ type: 'Articles' as const, id: _id })),
              { type: 'Articles' as const, id: 'LIST' },
            ]
          : [{ type: 'Articles' as const, id: 'LIST' }],
      keepUnusedDataFor: 180, // Giữ cache trong 3 phút
      // Thêm merge để hỗ trợ infinite scrolling
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        // Chỉ bao gồm query params cố định trong cache key, bỏ qua page và limit
        const { page: _, limit: __, ...fixedArgs } = queryArgs || {};
        return `${endpointName}-${JSON.stringify(fixedArgs)}`;
      },
      // Merge dữ liệu mới vào cache hiện tại
      merge: (currentCache, newItems, { arg }) => {
        // Nếu là trang đầu tiên, thay thế toàn bộ
        if (arg.page === 1) {
          return newItems;
        }
        
        // Nếu không phải trang đầu, merge vào cache hiện tại
        return {
          ...newItems,
          articles: [...currentCache.articles, ...newItems.articles],
          pagination: newItems.pagination
        };
      },
      // Chỉ refetch nếu arg thay đổi và không phải là page
      forceRefetch({ currentArg, previousArg }) {
        if (!previousArg) return true;
        
        const { page: _, ...currentRest } = currentArg || {};
        const { page: __, ...prevRest } = previousArg || {};
        
        // Nếu các params khác thay đổi, force refetch
        return JSON.stringify(currentRest) !== JSON.stringify(prevRest);
      },
    }),

    getArticleById: builder.query<Article, string>({
      query: (id) => `/articles/${id}`,
      providesTags: (result, error, id) => [{ type: 'Articles' as const, id }],
    }),

    createArticle: builder.mutation<Article, Partial<Article>>({
      query: (body) => ({
        url: '/articles',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Articles', id: 'LIST' }, 'Dashboard'],
    }),

    updateArticle: builder.mutation<Article, { id: string; body: Partial<Article> }>({
      query: ({ id, body }) => ({
        url: `/articles/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Articles', id: arg.id },
        { type: 'Articles', id: 'LIST' },
        'Dashboard',
      ],
    }),

    deleteArticle: builder.mutation<void, string>({
      query: (id) => ({
        url: `/articles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Articles', id: 'LIST' }, 'Dashboard'],
    }),

    // Leagues endpoints
    getLeagues: builder.query<League[], { status?: string }>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.status) {
          queryParams.append('status', params.status);
        }
        return { url: `/leagues?${queryParams.toString()}` };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Leagues' as const, id: _id })),
              { type: 'Leagues' as const, id: 'LIST' },
            ]
          : [{ type: 'Leagues' as const, id: 'LIST' }],
    }),

    getLeagueById: builder.query<League, string>({
      query: (id) => `/leagues/${id}`,
      providesTags: (result, error, id) => [{ type: 'Leagues' as const, id }],
    }),

    createLeague: builder.mutation<League, Partial<League>>({
      query: (body) => ({
        url: '/leagues',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Leagues', id: 'LIST' }, 'Dashboard'],
    }),

    updateLeague: builder.mutation<League, { id: string; body: Partial<League> }>({
      query: ({ id, body }) => ({
        url: `/leagues/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Leagues', id: arg.id },
        { type: 'Leagues', id: 'LIST' },
        'Dashboard',
      ],
    }),

    deleteLeague: builder.mutation<void, string>({
      query: (id) => ({
        url: `/leagues/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Leagues', id: 'LIST' }, 'Dashboard'],
    }),

    // Users endpoints với refetchOnFocus
    getUsers: builder.query<User[], void>({
      query: () => '/users',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Users' as const, id: _id })),
              { type: 'Users' as const, id: 'LIST' },
            ]
          : [{ type: 'Users' as const, id: 'LIST' }],
      keepUnusedDataFor: 300, // Cache 5 phút
      transformResponse: (baseQueryReturnValue: unknown) => {
        const response = baseQueryReturnValue as User[];
        // Đảm bảo các trường tùy chọn luôn có giá trị mặc định
        return response.map(user => ({
          ...user,
          lastLogin: user.lastLogin || undefined,
          isOnline: user.isOnline || false,
          analysis: user.analysis || { isAnalyzed: false },
          totalTasksCompleted: user.totalTasksCompleted || 0
        }));
      }
    }),

    getUserById: builder.query<User, string>({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'Users' as const, id }],
    }),

    createUser: builder.mutation<User, Partial<User> & { password: string }>({
      query: (body) => ({
        url: '/users',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Users', id: 'LIST' }, 'Dashboard'],
    }),

    updateUser: builder.mutation<User, { id: string; body: Partial<User> }>({
      query: ({ id, body }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Users', id: arg.id },
        { type: 'Users', id: 'LIST' },
      ],
    }),

    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Users', id: 'LIST' }, 'Dashboard'],
    }),

    resetPassword: builder.mutation<void, { id: string; password: string }>({
      query: ({ id, password }) => ({
        url: `/users/${id}/reset-password`,
        method: 'POST',
        body: { password },
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Users', id: arg.id }],
    }),
  }),
});

// Cấu hình để refetch khi focus/reconnect
export const setupApiListeners = (dispatch: AppDispatch): void => {
  setupListeners(dispatch);
};

// Export hooks
export const {
  useGetDashboardQuery,
  useGetMatchesQuery,
  useGetMatchByIdQuery,
  useCreateMatchMutation,
  useUpdateMatchMutation,
  useDeleteMatchMutation,
  
  // Articles
  useGetArticlesQuery,
  useGetArticleByIdQuery,
  useCreateArticleMutation,
  useUpdateArticleMutation,
  useDeleteArticleMutation,
  
  // Leagues
  useGetLeaguesQuery,
  useGetLeagueByIdQuery,
  useCreateLeagueMutation,
  useUpdateLeagueMutation,
  useDeleteLeagueMutation,
  
  // Users
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useResetPasswordMutation,
} = api; 

// Helper function để chuẩn hóa dữ liệu match từ nhiều nguồn khác nhau
const normalizeMatch = (match: Record<string, unknown>): Match => {
  // Xử lý analysisInfo nếu có
  let analysisData = {
    isAnalyzed: false,
    analysisStatus: 'not_analyzed' as 'not_analyzed' | 'analyzed'
  };
  
  if (typeof match.analysisInfo === 'object' && match.analysisInfo !== null) {
    const analysisInfo = match.analysisInfo as Record<string, unknown>;
    analysisData = {
      isAnalyzed: 'isAnalyzed' in analysisInfo ? Boolean(analysisInfo.isAnalyzed) : false,
      analysisStatus: 'analysisStatus' in analysisInfo && typeof analysisInfo.analysisStatus === 'string' 
                     ? (analysisInfo.analysisStatus as 'not_analyzed' | 'analyzed') : 'not_analyzed'
    };
  }
  
  // Duy trì phần analysis để tương thích ngược với code cũ
  let analysisOldData = null;
  if (typeof match.analysis === 'object' && match.analysis !== null) {
    const analysisInfo = match.analysis as Record<string, unknown>;
    const hasArticle = 'hasArticle' in analysisInfo ? Boolean(analysisInfo.hasArticle) : false;
    const isAnalyzed = 'isAnalyzed' in analysisInfo ? Boolean(analysisInfo.isAnalyzed) : false;
    
    // Đảm bảo aiStatus có giá trị hợp lệ
    let aiStatus: 'generated' | 'not_generated' | 'processing' = 'not_generated';
    if (isAnalyzed) {
      aiStatus = 'generated';
    } else if ('aiStatus' in analysisInfo && analysisInfo.aiStatus === 'processing') {
      aiStatus = 'processing';
    }
    
    analysisOldData = {
      isAnalyzed,
      aiStatus,
      articles: [],
      aiAnalysis: {
        content: '',
        generatedAt: '',
        status: 'pending'
      },
      wordpressPost: {
        postId: '',
        status: 'draft',
        publishedAt: '',
        url: ''
      }
    };
  }
  
  // Trả về đối tượng match với các trường đã chuẩn hóa
  const result = {
    ...(match as Record<string, unknown>), // Ép kiểu rõ ràng hơn
    // Đảm bảo các trường bắt buộc có giá trị mặc định
    homeTeam: typeof match.homeTeam === 'object' && match.homeTeam !== null 
      ? match.homeTeam 
      : { name: 'N/A', logo: '', score: 0 },
    awayTeam: typeof match.awayTeam === 'object' && match.awayTeam !== null 
      ? match.awayTeam 
      : { name: 'N/A', logo: '', score: 0 },
    // Sử dụng analysisInfo mới
    analysisInfo: typeof match.analysisInfo === 'object' && match.analysisInfo !== null 
      ? match.analysisInfo 
      : analysisData,
    // Hỗ trợ cả cấu trúc analysis cũ để tương thích ngược
    analysis: typeof match.analysis === 'object' && match.analysis !== null 
      ? match.analysis 
      : analysisOldData !== null ? analysisOldData : {
          isAnalyzed: false,
          aiStatus: 'not_generated' as const,
          articles: [],
          aiAnalysis: {
            content: '',
            generatedAt: '',
            status: 'pending'
          },
          wordpressPost: {
            postId: '',
            status: 'draft',
            publishedAt: '',
            url: ''
          }
        },
    // Đảm bảo trạng thái hợp lệ
    status: (typeof match.status === 'string' && ['scheduled', 'finished'].includes(match.status))
      ? match.status 
      : 'scheduled'
  };
  
  return result as unknown as Match;
};