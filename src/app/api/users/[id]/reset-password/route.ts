import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import mongoose from "mongoose";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerAuthSession();

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;

    // Kiểm tra id có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID người dùng không hợp lệ" }, { status: 400 });
    }

    const data = await request.json();

    // Kiểm tra có mật khẩu mới không
    if (!data.password) {
      return NextResponse.json({ error: "Bạn cần cung cấp mật khẩu mới" }, { status: 400 });
    }

    // Kết nối đến MongoDB
    await connectDB();

    // Tìm người dùng
    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });
    }

    // Thay đổi mật khẩu (sẽ được mã hóa qua middleware pre-save)
    user.password = data.password;
    user.updatedBy = new mongoose.Types.ObjectId(session.user.id);
    await user.save();

    return NextResponse.json({
      message: "Đặt lại mật khẩu thành công",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json({ error: "Lỗi khi đặt lại mật khẩu" }, { status: 500 });
  }
}
