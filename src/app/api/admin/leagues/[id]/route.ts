import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { League } from "@/models/League";
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
      return NextResponse.json({ error: "ID giải đấu không hợp lệ" }, { status: 400 });
    }

    // Kết nối database
    await connectDB();

    // Tìm giải đấu theo ID
    const league = await League.findById(id).lean();

    if (!league) {
      return NextResponse.json({ error: "Không tìm thấy giải đấu" }, { status: 404 });
    }

    return NextResponse.json(league);
  } catch (error) {
    return MiddlewareService.handleError(
      error,
      "Lỗi khi lấy thông tin giải đấu"
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
      return NextResponse.json({ error: "ID giải đấu không hợp lệ" }, { status: 400 });
    }

    // Kết nối database
    await connectDB();
    
    // Lấy dữ liệu từ request
    const data = await request.json();
    
    // Cập nhật thời gian
    data.updatedAt = new Date();
    
    // Cập nhật giải đấu
    const updatedLeague = await League.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    
    if (!updatedLeague) {
      return NextResponse.json({ error: "Không tìm thấy giải đấu" }, { status: 404 });
    }
    
    return MiddlewareService.successResponse(
      "Cập nhật giải đấu thành công",
      { league: updatedLeague }
    );
  } catch (error) {
    return MiddlewareService.handleError(
      error,
      "Lỗi khi cập nhật giải đấu"
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
      return NextResponse.json({ error: "ID giải đấu không hợp lệ" }, { status: 400 });
    }

    // Kết nối database
    await connectDB();
    
    // Kiểm tra xem có trận đấu nào sử dụng giải đấu này không
    const Match = mongoose.model("Match");
    const matchCount = await Match.countDocuments({ leagueId: id });
    
    if (matchCount > 0) {
      return NextResponse.json(
        { error: `Không thể xóa giải đấu này vì có ${matchCount} trận đấu đang sử dụng` },
        { status: 400 }
      );
    }
    
    // Xóa giải đấu
    const deletedLeague = await League.findByIdAndDelete(id);
    
    if (!deletedLeague) {
      return NextResponse.json({ error: "Không tìm thấy giải đấu" }, { status: 404 });
    }
    
    return MiddlewareService.successResponse(
      "Xóa giải đấu thành công",
      { leagueId: id }
    );
  } catch (error) {
    return MiddlewareService.handleError(
      error,
      "Lỗi khi xóa giải đấu"
    );
  }
}
