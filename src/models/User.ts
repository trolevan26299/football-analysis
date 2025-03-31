import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  role: { type: String, enum: ["admin", "ktv"], default: "ktv" },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  lastLogin: { type: Date },
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
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

// Xóa email index nếu tồn tại khi model được khởi tạo
const User = mongoose.models.User || mongoose.model("User", userSchema);
export { User };
