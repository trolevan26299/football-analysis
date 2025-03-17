import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";



export async function GET() {
  const session = await getServerAuthSession();

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
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
  const session = await getServerAuthSession();

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();

    // Kết nối MongoDB
    await connectDB();

    // Kiểm tra dữ liệu đầu vào
    if (!data.username || !data.password || !data.fullName || !data.email) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    // Kiểm tra username đã tồn tại chưa
    const existingUsername = await User.findOne({ username: data.username });
    if (existingUsername) {
      return NextResponse.json({ error: "Tên đăng nhập đã tồn tại" }, { status: 400 });
    }

    // Kiểm tra email đã tồn tại chưa
    const existingEmail = await User.findOne({ email: data.email });
    if (existingEmail) {
      return NextResponse.json({ error: "Email đã tồn tại" }, { status: 400 });
    }

    // Tạo người dùng mới
    const newUser = new User({
      username: data.username,
      password: data.password, // Sẽ được mã hóa tự động bởi middleware
      fullName: data.fullName,
      email: data.email,
      role: "ktv", // Mặc định là KTV
      status: data.status || "active",
      createdBy: session.user.id,
    });

    await newUser.save();

    return NextResponse.json({
      message: "Tạo người dùng thành công",
      user: {
        _id: newUser._id,
        username: newUser.username,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Lỗi khi tạo người dùng mới" }, { status: 500 });
  }
}
