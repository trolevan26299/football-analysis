/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { MiddlewareService } from "@/lib/middleware";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Xác thực người dùng admin
    const authError = await MiddlewareService.verifyUserRole(["admin"]);
    if (authError) return authError;

    const { id } = params;
    
    // Kiểm tra ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID người dùng không hợp lệ" }, { status: 400 });
    }

    // Kết nối database
    await connectDB();

    // Tìm người dùng theo ID và loại bỏ trường password
    const user = await User.findById(id).select("-password").lean();

    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return MiddlewareService.handleError(
      error,
      "Lỗi khi lấy thông tin người dùng"
    );
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    // Xác thực người dùng admin
    const authError = await MiddlewareService.verifyUserRole(["admin"]);
    if (authError) return authError;

    const { id } = params;
    
    // Kiểm tra ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID người dùng không hợp lệ" }, { status: 400 });
    }

    // Kết nối database
    await connectDB();
    
    // Lấy dữ liệu từ request
    const data = await request.json();
    
    // Tạo đối tượng dữ liệu cập nhật
    const updateData: any = {
      updatedAt: new Date(),
    };
    
    // Cập nhật các trường từ request
    if (data.username !== undefined) {
      // Kiểm tra username mới có trùng với người dùng khác không
      const existingUser = await User.findOne({ 
        username: data.username,
        _id: { $ne: id }
      });
      
      if (existingUser) {
        return NextResponse.json(
          { error: "Username đã tồn tại" },
          { status: 400 }
        );
      }
      
      updateData.username = data.username;
    }
    
    if (data.role !== undefined) {
      updateData.role = data.role;
    }
    
    // Nếu có password mới, hash password
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }
    
    // Cập nhật người dùng
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");
    
    if (!updatedUser) {
      return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });
    }
    
    return MiddlewareService.successResponse(
      "Cập nhật người dùng thành công",
      { user: updatedUser }
    );
  } catch (error) {
    return MiddlewareService.handleError(
      error,
      "Lỗi khi cập nhật người dùng"
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Xác thực người dùng admin
    const authError = await MiddlewareService.verifyUserRole(["admin"]);
    if (authError) return authError;

    const { id } = params;
    
    // Kiểm tra ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID người dùng không hợp lệ" }, { status: 400 });
    }

    // Kết nối database
    await connectDB();
    
    // Ngăn chặn xóa admin cuối cùng
    const adminCount = await User.countDocuments({ role: "admin" });
    const userToDelete = await User.findById(id);
    
    if (userToDelete?.role === "admin" && adminCount <= 1) {
      return NextResponse.json(
        { error: "Không thể xóa admin cuối cùng trong hệ thống" },
        { status: 400 }
      );
    }
    
    // Xóa người dùng
    const deletedUser = await User.findByIdAndDelete(id);
    
    if (!deletedUser) {
      return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });
    }
    
    return MiddlewareService.successResponse(
      "Xóa người dùng thành công",
      { userId: id }
    );
  } catch (error) {
    return MiddlewareService.handleError(
      error,
      "Lỗi khi xóa người dùng"
    );
  }
}
