/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { League } from "@/models/League";
import { MiddlewareService } from "@/lib/middleware";

export async function GET() {
  try {
    // Xác thực người dùng admin
    const authError = await MiddlewareService.verifyUserRole(["admin"]);
    if (authError) return authError;

    // Kết nối database
    await connectDB();

    // Lấy tất cả giải đấu, sắp xếp theo ngày tạo mới nhất
    const leagues = await League.find()
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(leagues);
  } catch (error) {
    return MiddlewareService.handleError(
      error,
      "Lỗi khi lấy danh sách giải đấu"
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

    // Tạo giải đấu mới
    const newLeague = new League({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Lưu vào database
    await newLeague.save();

    return MiddlewareService.successResponse("Tạo giải đấu thành công", {
      league: newLeague
    });
  } catch (error) {
    return MiddlewareService.handleError(
      error,
      "Lỗi khi tạo giải đấu mới"
    );
  }
}
