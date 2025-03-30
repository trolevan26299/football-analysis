import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Match } from "@/models/Match";
import { MiddlewareService } from "@/lib/middleware";

export async function GET() {
  try {
    // Xác thực người dùng admin
    const authError = await MiddlewareService.verifyUserRole(["admin"]);
    if (authError) return authError;

    // Kết nối database
    await connectDB();

    // Lấy tất cả trận đấu, sắp xếp theo ngày trận đấu mới nhất
    const matches = await Match.find()
      .sort({ matchDate: -1 })
      .populate("leagueId", "name country season")
      .lean();

    return NextResponse.json(matches);
  } catch (error) {
    return MiddlewareService.handleError(
      error,
      "Lỗi khi lấy danh sách trận đấu"
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

    // Tạo trận đấu mới
    const newMatch = new Match({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Lưu vào database
    await newMatch.save();

    return MiddlewareService.successResponse("Tạo trận đấu thành công", {
      match: newMatch
    });
  } catch (error) {
    return MiddlewareService.handleError(
      error,
      "Lỗi khi tạo trận đấu mới"
    );
  }
} 