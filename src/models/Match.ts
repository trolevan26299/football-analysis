import mongoose from "mongoose";

const matchSchema = new mongoose.Schema({
  // Liên kết với giải đấu
  leagueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "League",
    required: true,
  },

  // Thông tin đội bóng
  homeTeam: {
    name: { type: String, required: true },
    logo: { type: String },
    score: { type: Number, default: 0 },
  },
  awayTeam: {
    name: { type: String, required: true },
    logo: { type: String },
    score: { type: Number, default: 0 },
  },

  // Thời gian trận đấu
  matchDate: { type: Date, required: true },
  kickoffTime: { type: String, required: true }, // Format: "HH:mm"

  // Địa điểm
  venue: {
    name: { type: String },
    city: { type: String },
  },

  // Trạng thái trận đấu
  status: {
    type: String,
    enum: ["scheduled", "live", "finished", "postponed", "cancelled"],
    default: "scheduled",
  },

  // Thông tin vòng đấu
  round: {
    type: String,
    required: true,
  },

  // Thông tin bài viết phân tích
  analysis: {
    isAnalyzed: { type: Boolean, default: false },
    articles: [
      {
        title: String,
        url: String,
        source: String,
        content: String,
        crawledAt: Date,
      },
    ],
    aiAnalysis: {
      content: String,
      generatedAt: Date,
      status: {
        type: String,
        enum: ["pending", "generated", "failed"],
        default: "pending",
      },
    },
    wordpressPost: {
      postId: String,
      status: {
        type: String,
        enum: ["draft", "published", "failed"],
        default: "draft",
      },
      publishedAt: Date,
      url: String,
    },
  },

  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware để tự động cập nhật updatedAt
matchSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Tạo các indexes để tối ưu truy vấn
matchSchema.index({ leagueId: 1, matchDate: 1 });
matchSchema.index({ status: 1 });
matchSchema.index({ "analysis.isAnalyzed": 1 });
matchSchema.index({ "analysis.wordpressPost.status": 1 });

// Virtual field để lấy trạng thái phân tích
matchSchema.virtual("analysisStatus").get(function () {
  if (!this?.analysis?.isAnalyzed) return "Chưa phân tích";
  if (this?.analysis?.aiAnalysis?.status === "generated") return "Đã phân tích";
  if (this?.analysis.wordpressPost?.status === "published") return "Đã đăng";
  return "Đang xử lý";
});

// Phương thức để kiểm tra xem trận đấu có thể phân tích chưa
matchSchema.methods.canAnalyze = function () {
  return this.analysis.articles.length > 0 && !this.analysis.isAnalyzed;
};

// Phương thức để kiểm tra xem bài viết có thể đăng WordPress không
matchSchema.methods.canPublishToWordpress = function () {
  return this.analysis.aiAnalysis.status === "generated" && this.analysis.wordpressPost.status === "draft";
};

export const Match = mongoose.models.Match || mongoose.model("Match", matchSchema);
