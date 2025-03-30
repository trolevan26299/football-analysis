/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Type definitions cho phân tích trận đấu
 */

// Trạng thái của quá trình phân tích AI
export type AIAnalysisStatus = "not_started" | "generating" | "generated" | "error";

// Trạng thái phân tích tổng thể
export type AnalysisStatus = "not_analyzed" | "processing" | "generated" | "error";

// Cấu trúc của bài báo phân tích
export interface Article {
  title: string;
  url: string;
  source: string;
  content: string;
  fetchedAt: Date;
}

// Cấu trúc dự đoán tỷ số
export interface PredictedScore {
  home: number;
  away: number;
}

// Cấu trúc phân tích AI
export interface AIAnalysis {
  content: string;
  status: AIAnalysisStatus;
  generatedAt?: Date;
  predictedScore?: PredictedScore;
}

// Cấu trúc thông tin phân tích đầy đủ của trận đấu
export interface MatchAnalysis {
  isAnalyzed: boolean;
  aiStatus: AnalysisStatus;
  aiAnalysis: AIAnalysis;
  articles: Article[];
}

// Dữ liệu đầu vào để cập nhật phân tích
export interface UpdateAnalysisData {
  articles: Array<{
    title?: string;
    url?: string;
    source?: string;
    content?: string;
  }>;
  aiAnalysisContent: string;
  predictedScore?: PredictedScore;
}

// Kết quả trả về sau khi phân tích
export interface AnalysisResult {
  _id: string;
  homeTeam: {
    name: string;
    [key: string]: any;
  };
  awayTeam: {
    name: string;
    [key: string]: any;
  };
  analysis: {
    aiStatus: AnalysisStatus;
    isAnalyzed?: boolean;
    aiAnalysis: {
      status: AIAnalysisStatus;
    };
  };
} 