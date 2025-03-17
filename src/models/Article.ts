import mongoose from "mongoose";

const articleSchema = new mongoose.Schema({
  // Liên kết với trận đấu
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Match",
    required: true,
    index: true
  },

  // Thông tin tóm tắt về trận đấu để hiển thị nhanh
  matchInfo: {
    homeTeam: {
      name: { type: String, required: true },
      logo: { type: String }
    },
    awayTeam: {
      name: { type: String, required: true },
      logo: { type: String }
    },
    matchDate: { type: Date, required: true },
    kickoffTime: { type: String, required: true },
    leagueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "League"
    },
    leagueName: { type: String },
    leagueLogo: { type: String }
  },

  // Các bài viết tìm kiếm từ Google
  referencedArticles: [
    {
      title: { type: String },
      url: { type: String },
      source: { type: String },
      content: { type: String },
      fetchedAt: { type: Date, default: Date.now }
    }
  ],

  // Phân tích bởi AI
  aiAnalysis: {
    content: { type: String, default: "" },
    generatedAt: { type: Date },
    status: {
      type: String,
      enum: ["pending", "generating", "generated", "failed"],
      default: "pending"
    },
    predictedScore: {
      home: { type: Number },
      away: { type: Number }
    }
  },

  // Trạng thái xử lý
  analysisStatus: {
    type: String,
    enum: ["not_analyzed", "in_progress", "completed"],
    default: "not_analyzed"
  },

  // Thông tin về người tạo và thời gian
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware để tự động cập nhật updatedAt
articleSchema.pre("save", function(next) {
  this.updatedAt = new Date();
  next();
});

// Indexes để tối ưu truy vấn
articleSchema.index({ "matchInfo.matchDate": -1 });
articleSchema.index({ "matchInfo.leagueId": 1 });
articleSchema.index({ analysisStatus: 1 });
articleSchema.index({ "aiAnalysis.status": 1 });

// Phương thức kiểm tra xem đã có đủ dữ liệu để phân tích chưa
articleSchema.methods.canAnalyze = function() {
  return this.referencedArticles.length > 0 && this.analysisStatus !== "completed";
};

export const Article = mongoose.models.Article || mongoose.model("Article", articleSchema); 