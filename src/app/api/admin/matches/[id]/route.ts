import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Match } from "@/models/Match";
import { MiddlewareService } from "@/lib/middleware";
import mongoose from "mongoose";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Xác thực người dùng admin
    const authError = await MiddlewareService.verifyUserRole(["admin"]);
    if (authError) return authError;

    const { id } = params;
    
    // Kiểm tra ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID trận đấu không hợp lệ" }, { status: 400 });
    }

    // Kết nối database
    await connectDB();

    // Tìm trận đấu theo ID
    const match = await Match.findById(id)
      .populate("leagueId", "name country season")
      .lean();

    if (!match) {
      return NextResponse.json({ error: "Không tìm thấy trận đấu" }, { status: 404 });
    }

    return NextResponse.json(match);
  } catch (error) {
    return MiddlewareService.handleError(
      error,
      "Lỗi khi lấy thông tin trận đấu"
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
      return NextResponse.json({ error: "ID trận đấu không hợp lệ" }, { status: 400 });
    }

    // Kết nối database
    await connectDB();
    
    // Lấy dữ liệu từ request
    const data = await request.json();
    
    // Cập nhật thời gian
    data.updatedAt = new Date();
    
    // Cập nhật trận đấu
    const updatedMatch = await Match.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    
    if (!updatedMatch) {
      return NextResponse.json({ error: "Không tìm thấy trận đấu" }, { status: 404 });
    }
    
    return MiddlewareService.successResponse(
      "Cập nhật trận đấu thành công",
      { match: updatedMatch }
    );
  } catch (error) {
    return MiddlewareService.handleError(
      error,
      "Lỗi khi cập nhật trận đấu"
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
      return NextResponse.json({ error: "ID trận đấu không hợp lệ" }, { status: 400 });
    }

    // Kết nối database
    await connectDB();
    
    // Xóa trận đấu
    const deletedMatch = await Match.findByIdAndDelete(id);
    
    if (!deletedMatch) {
      return NextResponse.json({ error: "Không tìm thấy trận đấu" }, { status: 404 });
    }
    
    return MiddlewareService.successResponse(
      "Xóa trận đấu thành công",
      { matchId: id }
    );
  } catch (error) {
    return MiddlewareService.handleError(
      error,
      "Lỗi khi xóa trận đấu"
    );
  }
}
