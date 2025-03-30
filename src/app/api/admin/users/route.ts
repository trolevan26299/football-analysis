import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { MiddlewareService } from "@/lib/middleware";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    // Xác thực người dùng admin
    const authError = await MiddlewareService.verifyUserRole(["admin"]);
    if (authError) return authError;

    // Kết nối database
    await connectDB();

    // Lấy tất cả users, sắp xếp theo ngày tạo mới nhất và loại bỏ trường password
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(users);
  } catch (error) {
    return MiddlewareService.handleError(
      error,
      "Lỗi khi lấy danh sách người dùng"
    );
  }
}

export async function POST(request: Request) {
  try {
    // Xác thực người dùng admin
    const authError = await MiddlewareService.verifyUserRole(["admin"]);
    if (authError) return authError;

    // Kết nối database
    await connectDB();

    // Lấy dữ liệu từ request
    const data = await request.json();
    
    // Kiểm tra username đã tồn tại chưa
    const existingUser = await User.findOne({ username: data.username });
    if (existingUser) {
      return NextResponse.json(
        { error: "Username đã tồn tại" },
        { status: 400 }
      );
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    // Tạo user mới
    const newUser = new User({
      username: data.username,
      password: hashedPassword,
      role: data.role || "ktv", // Mặc định là ktv nếu không chỉ định
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Lưu vào database
    await newUser.save();
    
    // Trả về user đã tạo nhưng loại bỏ password
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return MiddlewareService.successResponse("Tạo người dùng thành công", {
      user: userResponse
    });
  } catch (error) {
    return MiddlewareService.handleError(
      error,
      "Lỗi khi tạo người dùng mới"
    );
  }
}
