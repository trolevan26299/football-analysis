/* eslint-disable @typescript-eslint/no-explicit-any */
import { Match } from "@/models/Match";
import { connectDB } from "./mongodb";
import mongoose from "mongoose";
import {
  AnalysisResult,
  UpdateAnalysisData
} from "@/types/analysis";


// API service cho trận đấu
export const MatchService = {
  
  async getById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("ID trận đấu không hợp lệ");
    }
    
    await connectDB();
    const match = await Match.findById(id);
    
    if (!match) {
      throw new Error("Không tìm thấy trận đấu");
    }
    
    return match;
  },
  
 // Phân tích trận đấu
  async startAnalysis(id: string) {
    const match = await this.getById(id);
    
    // Kiểm tra trạng thái
    if (match.analysis.aiStatus === "processing") {
      throw new Error("Trận đấu đang được phân tích");
    }
    
    if (match.analysis.aiStatus === "generated") {
      throw new Error("Trận đấu đã được phân tích");
    }
    
    // Cập nhật trạng thái
    match.analysis.aiStatus = "processing";
    match.analysis.aiAnalysis.status = "generating";
    await match.save();
    
    return match;
  },
  
  // Cập nhật kết quả phân tích trận đấu
  async updateAnalysis(id: string, data: UpdateAnalysisData) {
    const { articles, aiAnalysisContent, predictedScore } = data;
    
    if (!articles || !Array.isArray(articles) || !aiAnalysisContent) {
      throw new Error("Dữ liệu không hợp lệ, cần có articles và aiAnalysisContent");
    }
    
    const match = await this.getById(id);
    
    // Cập nhật danh sách bài viết
    match.analysis.articles = articles.map(article => ({
      title: article.title || "",
      url: article.url || "",
      source: article.source || "",
      content: article.content || "",
      fetchedAt: new Date()
    }));
    
    // Cập nhật bài phân tích AI
    match.analysis.aiAnalysis.content = aiAnalysisContent;
    match.analysis.aiAnalysis.generatedAt = new Date();
    match.analysis.aiAnalysis.status = "generated";
    
    // Cập nhật dự đoán tỷ số nếu có
    if (predictedScore && typeof predictedScore === 'object') {
      if (predictedScore.home !== undefined) {
        match.analysis.aiAnalysis.predictedScore = {
          home: predictedScore.home,
          away: predictedScore.away || 0
        };
      }
    }
    
    // Cập nhật trạng thái
    match.analysis.isAnalyzed = true;
    match.analysis.aiStatus = "generated";
    
    // Lưu thay đổi
    await match.save();
    
    return match;
  },
  
  // Chuyển đổi kết quả match thành dạng trả về cho API
  formatAnalysisResult(match: any): AnalysisResult {
    return {
      _id: match._id,
      homeTeam: {
        name: match.homeTeam.name,
      },
      awayTeam: {
        name: match.awayTeam.name,
      },
      analysis: {
        aiStatus: match.analysis.aiStatus,
        isAnalyzed: match.analysis.isAnalyzed,
        aiAnalysis: {
          status: match.analysis.aiAnalysis.status
        }
      }
    };
  }
}; 