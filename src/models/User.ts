import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ["admin", "ktv"], default: "ktv" },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  isOnline: { type: Boolean, default: false },
  lastLogin: { type: Date },
  currentTasks: { type: Number, default: 0 },
  totalTasksCompleted: { type: Number, default: 0 },
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
userSchema.pre("save", function (next) {
  this.updatedAt = new Date();

  // Nếu mật khẩu thay đổi thì mã hóa
  if (this.isModified("password")) {
    this.password = bcrypt.hashSync(this.password, 10);
  }

  next();
});

// Phương thức so sánh mật khẩu
userSchema.methods.comparePassword = function (password: string) {
  return bcrypt.compareSync(password, this.password);
};

// Tạo indexes cho các trường chưa có index
// Không cần tạo index cho username và email vì đã được tạo tự động qua unique: true
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

export const User = mongoose.models.User || mongoose.model("User", userSchema);
