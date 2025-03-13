/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import mongoose from "mongoose";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerAuthSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;

    // Kiểm tra id có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID người dùng không hợp lệ" }, { status: 400 });
    }

    // Kết nối đến MongoDB
    await connectDB();

    // Tìm người dùng theo id
    const user = await User.findById(id).select("-password").lean();

    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Lỗi khi tải thông tin người dùng" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
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

    // Kiểm tra dữ liệu đầu vào
    if (!data.fullName || !data.email) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    // Kết nối đến MongoDB
    await connectDB();

    // Kiểm tra xem email đã tồn tại chưa (trừ người dùng hiện tại)
    const existingEmail = await User.findOne({
      email: data.email,
      _id: { $ne: id },
    });

    if (existingEmail) {
      return NextResponse.json({ error: "Email đã tồn tại" }, { status: 400 });
    }

    // Chuẩn bị dữ liệu cập nhật
    const updateData: any = {
      fullName: data.fullName,
      email: data.email,
      status: data.status,
      updatedBy: session.user.id,
      updatedAt: new Date(),
    };

    // Cập nhật mật khẩu nếu có
    if (data.password) {
      // Mật khẩu sẽ được mã hóa bởi middleware pre-save
      // nhưng không kích hoạt khi sử dụng findByIdAndUpdate
      // nên cần xử lý trực tiếp
      const user = await User.findById(id);
      if (user) {
        user.password = data.password;
        await user.save();
      }
    }

    // Cập nhật người dùng (trừ mật khẩu)
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Cập nhật người dùng thành công",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Lỗi khi cập nhật người dùng" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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

    // Kết nối đến MongoDB
    await connectDB();

    // Tìm và xóa người dùng
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Xóa người dùng thành công",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Lỗi khi xóa người dùng" }, { status: 500 });
  }
}
