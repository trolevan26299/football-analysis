/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Match } from "@/models/Match";
import { MiddlewareService } from "@/lib/middleware";

export async function GET(req: Request) {
  try {
    // Xác thực người dùng admin
    const authError = await MiddlewareService.verifyUserRole(["admin"]);
    if (authError) return authError;

    // Kết nối database
    await connectDB();

    // Xử lý các tham số query
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const search = url.searchParams.get("search") || "";
    const leagueId = url.searchParams.get("leagueId") || "";
    const status = url.searchParams.get("status") || "";

    console.log("Query params:", { page, limit, search, leagueId, status });

    // Tạo query filter
    const filter: any = {};

    // Thêm filter theo tên đội
    if (search) {
      filter["$or"] = [
        { "homeTeam.name": { $regex: search, $options: "i" } },
        { "awayTeam.name": { $regex: search, $options: "i" } }
      ];
    }

    // Thêm filter theo giải đấu
    if (leagueId) {
      filter.leagueId = leagueId;
    }

    // Thêm filter theo trạng thái
    if (status) {
      filter.status = status;
    }

    // Tính tổng số trận đấu theo filter
    const total = await Match.countDocuments(filter);

    // Lấy tất cả trận đấu, sắp xếp theo ngày trận đấu mới nhất
    const matches = await Match.find(filter)
      .sort({ matchDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("leagueId", "name country season")
      .lean();

    return NextResponse.json({
      matches,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
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