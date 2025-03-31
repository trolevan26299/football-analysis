import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { MiddlewareService } from "@/lib/middleware";
import { getServerAuthSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    // Xác thực người dùng admin
    const authError = await MiddlewareService.verifyUserRole(["admin"], req);
    if (authError) return authError;

    // Kết nối MongoDB
    await connectDB();

    // Lấy danh sách KTV từ cơ sở dữ liệu
    const users = await User.find({ role: "ktv" }).sort({ createdAt: -1 }).lean();

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Lỗi khi tải dữ liệu người dùng" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Xác thực người dùng admin
    const authError = await MiddlewareService.verifyUserRole(["admin"], request);
    if (authError) return authError;

    const session = await getServerAuthSession();
    const data = await request.json();

    // Kết nối MongoDB
    await connectDB();

    // Kiểm tra dữ liệu đầu vào - chỉ yêu cầu username, password, fullName
    if (!data.username || !data.password || !data.fullName) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    // Kiểm tra username đã tồn tại chưa
    const existingUsername = await User.findOne({ username: data.username });
    if (existingUsername) {
      return NextResponse.json({ error: "Tên đăng nhập đã tồn tại" }, { status: 400 });
    }

    // Tạo người dùng mới
    const newUser = new User({
      username: data.username,
      password: data.password, // Sẽ được mã hóa tự động bởi middleware
      fullName: data.fullName,
      role: "ktv", // Mặc định là KTV
      status: data.status || "active",
      createdBy: session?.user?.id,
    });

    await newUser.save();

    return NextResponse.json({
      message: "Tạo người dùng thành công",
      user: {
        _id: newUser._id,
        username: newUser.username,
        fullName: newUser.fullName,
        role: newUser.role,
        status: newUser.status,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Lỗi khi tạo người dùng mới" }, { status: 500 });
  }
}
