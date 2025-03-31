// Re-export everything from each type file for easier imports
export * from "./dashboard";
export * from "./user";
export * from "./football";
export * from "./ui";

// Common types used across multiple components
export interface ResponseSuccess<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ResponseError {
  success: false;
  error: string;
  message: string;
  statusCode?: number;
}

export type ApiResponse<T = unknown> = ResponseSuccess<T> | ResponseError;

// Auth related types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

// Utility types
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;

// Các interfaces liên quan đến User
export interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'admin' | 'ktv';
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  isOnline?: boolean;
  analysis?: {
    isAnalyzed: boolean;
  };
  totalTasksCompleted?: number;
}

export interface UserFormData {
  username: string;
  password?: string;
  fullName: string;
  email: string;
  role?: 'admin' | 'ktv';
  status: 'active' | 'inactive';
}

// Các interfaces liên quan đến Match
export interface Match {
  _id: string;
  leagueId:  {
    _id: string;
    name: string;
    logo?: string;
  }
  
  homeTeam: {
    name: string;
    logo: string;
    score: number;
  };
  awayTeam: {
    name: string;
    logo: string;
    score: number;
  };
  matchDate: string;
  status: 'scheduled' | 'finished';
  analysisInfo: {
    isAnalyzed: boolean;
    analysisStatus: 'not_analyzed' | 'analyzed';
  };
  // Thông tin thuộc tính cũ - giữ lại để tương thích với API cũ
  analysis?: {
    isAnalyzed: boolean;
    aiStatus: 'generated' | 'not_generated' | 'processing';
    articles: Array<{
      title: string;
      url: string;
      source: string;
    }>;
    aiAnalysis: {
      content: string;
      generatedAt: string;
      status: 'pending' | 'completed' | 'failed';
    };
    wordpressPost: {
      postId: string;
      status: 'draft' | 'published' | 'error';
      publishedAt: string;
      url: string;
    };
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface MatchFormData {
  leagueId: string;
  homeTeamName: string;
  awayTeamName: string;
  matchDate: Date | string;
}

// Các interfaces liên quan đến League
export interface League {
  _id: string;
  name: string;
  country: string;
  season: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface LeagueFormData {
  name: string;
  country: string;
  season: string;
  status: 'active' | 'inactive';
}

// Các interfaces liên quan đến Article
export interface Article {
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

// Các interfaces liên quan đến Dashboard
export interface DashboardStats {
  totalMatches: number;
  pendingAnalysis: number;
  totalArticles: number;
  totalUsers: number;
  totalLeagues: number;
  activeLeagues: number;
  recentMatches: Array<Match>;
  recentArticles: Array<Article>;
}

// Các interfaces liên quan đến pagination và response
export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MatchesResponse {
  matches: Match[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ArticlesResponse {
  articles: Article[];
  pagination: PaginationData;
}

// Các interfaces cho request parameters
export interface QueryParams {
  [key: string]: string | number | boolean | undefined | null;
}

export interface MatchRequest {
  page?: number;
  limit?: number;
  leagueId?: string;
  status?: string;
  search?: string;
}

export interface ArticleRequest {
  page?: number;
  limit?: number;
  team?: string;
  league?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: string;
  search?: string;
}
