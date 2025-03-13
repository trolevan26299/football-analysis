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

    // Kiểm tra trạng thái mới
    if (!data.status || !["active", "inactive"].includes(data.status)) {
      return NextResponse.json({ error: "Trạng thái không hợp lệ" }, { status: 400 });
    }

    // Kết nối đến MongoDB
    await connectDB();

    // Cập nhật trạng thái người dùng
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          status: data.status,
          updatedBy: session.user.id,
          updatedAt: new Date(),
        },
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });
    }

    return NextResponse.json({
      message: `Đã ${data.status === "active" ? "kích hoạt" : "vô hiệu hóa"} người dùng thành công`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error toggling user status:", error);
    return NextResponse.json({ error: "Lỗi khi thay đổi trạng thái người dùng" }, { status: 500 });
  }
}
