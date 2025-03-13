export interface MatchCardData {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  status: string;
}

export interface ArticleCardData {
  id: string;
  title: string;
  status: string;
  createdAt: string;
}

export interface DashboardStats {
  totalMatches: number;
  pendingAnalysis: number;
  totalArticles: number;
  totalUsers: number;
  totalLeagues: number;
  activeLeagues: number;
  recentMatches: MatchCardData[];
  recentArticles: ArticleCardData[];
}

export type StatCardColor = "primary" | "secondary" | "success" | "error" | "warning" | "info" | "dark" | "light";

export interface TableColumn<T = unknown> {
  id: string;
  label: string;
  minWidth?: number;
  align?: "left" | "right" | "center";
  format?: (value: unknown) => string | React.ReactNode;
  sortable?: boolean;
  renderCell?: (row: T) => React.ReactNode;
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterState {
  [key: string]: string | boolean | number | null;
}
