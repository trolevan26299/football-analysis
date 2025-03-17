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
  status: { type: String, required: true },

  // Thông tin vòng đấu
  round: {
    type: String,
    required: true,
  },

  // Thông tin tham chiếu đến bài phân tích
  analysisInfo: {
    hasArticle: { type: Boolean, default: false },
    articleId: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article" 
    },
    analysisStatus: { 
      type: String, 
      enum: ["not_analyzed", "in_progress", "completed"],
      default: "not_analyzed"
    }
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
matchSchema.index({ "analysisInfo.hasArticle": 1 });
matchSchema.index({ "analysisInfo.analysisStatus": 1 });

// Virtual field để lấy trạng thái phân tích
matchSchema.virtual("analysisStatusText").get(function () {
  if (!this?.analysisInfo?.hasArticle) return "Chưa phân tích";
  if (this?.analysisInfo?.analysisStatus === "completed") return "Đã phân tích";
  if (this?.analysisInfo?.analysisStatus === "in_progress") return "Đang xử lý";
  return "Chưa phân tích";
});

export const Match = mongoose.models.Match || mongoose.model("Match", matchSchema); 