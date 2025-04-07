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
    logo: { type: String, default: "" },
    score: { type: Number, default: 0 },
  },
  awayTeam: {
    name: { type: String, required: true },
    logo: { type: String, default: "" },
    score: { type: Number, default: 0 },
  },

  // Thời gian trận đấu
  matchDate: { type: Date, required: true },
  
  // Trạng thái trận đấu
  status: { 
    type: String, 
    enum: ["scheduled", "finished"],
    default: "scheduled"
  },

  // Thông tin phân tích đơn giản hóa
  analysisInfo: {
    isAnalyzed: { type: Boolean, default: false },
    analysisStatus: { 
      type: String, 
      enum: ["not_analyzed", "analyzed"],
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
matchSchema.index({ "analysisInfo.isAnalyzed": 1 });
matchSchema.index({ "analysisInfo.analysisStatus": 1 });

// Thêm middleware để kiểm tra nếu trận đấu đã diễn ra
matchSchema.pre("save", function(next) {
  const currentDate = new Date();
  const matchDate = new Date(this.matchDate);
  
  // Lấy chỉ ngày, bỏ qua giờ phút giây để so sánh chính xác
  const matchDateOnly = new Date(Date.UTC(matchDate.getFullYear(), matchDate.getMonth(), matchDate.getDate()));
  const currentDateOnly = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()));
  
  // Nếu ngày thi đấu ở quá khứ (nhỏ hơn ngày hiện tại) và trạng thái vẫn là "scheduled", 
  // thì tự động cập nhật thành "finished"
  if (matchDateOnly < currentDateOnly && this.status === "scheduled") {
    this.status = "finished";
  }
  
  // Ngược lại, nếu ngày thi đấu ở tương lai/hiện tại và trạng thái đã được cập nhật tự động thành finished,
  // thì cần đổi lại thành scheduled (nhưng chỉ khi không có sự thay đổi trực tiếp trong request)
  // Trường hợp này xảy ra khi admin cập nhật ngày của trận đấu đã diễn ra thành ngày trong tương lai
  if (matchDateOnly >= currentDateOnly && this.status === "finished" && !this.isModified('status')) {
    this.status = "scheduled";
  }
  
  next();
});

export const Match = mongoose.models.Match || mongoose.model("Match", matchSchema); 