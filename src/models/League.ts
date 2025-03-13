import mongoose from "mongoose";

const leagueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
  season: { type: String, required: true },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Middleware để tự động cập nhật updatedAt
leagueSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Tạo các indexes để tối ưu truy vấn
leagueSchema.index({ status: 1 });
leagueSchema.index({ country: 1 });
leagueSchema.index({ name: 1, season: 1 }, { unique: true });

export const League = mongoose.models.League || mongoose.model("League", leagueSchema);
