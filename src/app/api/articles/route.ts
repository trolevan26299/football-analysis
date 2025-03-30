/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Article } from "@/models/Article";
import { getServerAuthSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    await connectDB();
    const session = await getServerAuthSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Lấy các tham số truy vấn
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "12");
    const league = url.searchParams.get("league");
    const team = url.searchParams.get("team");
    const dateFrom = url.searchParams.get("dateFrom");
    const dateTo = url.searchParams.get("dateTo");
    const sortBy = url.searchParams.get("sortBy") || "matchDate";
    const sortOrder = url.searchParams.get("sortOrder") || "desc";

    // Xây dựng query
    const query: any = { "aiAnalysis.status": "generated" };

    // Lọc theo giải đấu
    if (league) {
      query["matchInfo.leagueName"] = league;
    }

    // Lọc theo đội bóng
    if (team) {
      query["$or"] = [
        { "matchInfo.homeTeam.name": { $regex: team, $options: "i" } },
        { "matchInfo.awayTeam.name": { $regex: team, $options: "i" } },
      ];
    }

    // Lọc theo khoảng thời gian
    if (dateFrom || dateTo) {
      query["matchInfo.matchDate"] = {};
      if (dateFrom) {
        query["matchInfo.matchDate"]["$gte"] = new Date(dateFrom);
      }
      if (dateTo) {
        query["matchInfo.matchDate"]["$lte"] = new Date(dateTo);
      }
    }

    // Tính tổng số bài viết
    const total = await Article.countDocuments(query);

    // Tạo options cho việc sắp xếp
    const sortOptions: any = {};
    if (sortBy === "matchDate") {
      sortOptions["matchInfo.matchDate"] = sortOrder === "asc" ? 1 : -1;
    } else if (sortBy === "createdAt") {
      sortOptions["createdAt"] = sortOrder === "asc" ? 1 : -1;
    } else if (sortBy === "leagueName") {
      sortOptions["matchInfo.leagueName"] = sortOrder === "asc" ? 1 : -1;
    }

    // Lấy danh sách các bài phân tích đã hoàn thành với phân trang
    const articles = await Article.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit)
      .select({
        "_id": 1,
        "matchId": 1,
        "matchInfo": 1,
        "aiAnalysis.content": 1,
        "aiAnalysis.generatedAt": 1,
        "aiAnalysis.predictedScore": 1
      });

    // Lấy danh sách các giải đấu để hiển thị bộ lọc
    const leagues = await Article.distinct("matchInfo.leagueName");

    return NextResponse.json({
      articles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      filters: {
        leagues
      }
    });
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 