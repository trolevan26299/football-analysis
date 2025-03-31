import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { League } from "@/models/League";




export async function GET(request: Request) {
  const session = await getServerAuthSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Lấy các tham số từ URL
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Kết nối MongoDB
    console.log("Attempting to connect to MongoDB...");
    await connectDB();
    console.log("MongoDB connection successful");

    // Xây dựng query dựa trên các tham số
    const query: Record<string, string> = {};
    if (status) {
      query.status = status;
    }

    // Lấy danh sách giải đấu từ cơ sở dữ liệu với query
    console.log("Fetching leagues from database with query:", query);
    const leagues = await League.find(query).sort({ createdAt: -1 }).lean();
    console.log("Leagues fetched:", leagues.length);

    return NextResponse.json(leagues);
  } catch (error) {
    console.error("Error fetching leagues:", error);
    return NextResponse.json({ error: "Lỗi khi tải dữ liệu giải đấu" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerAuthSession();

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();

    // Kết nối MongoDB
    await connectDB();

    // Kiểm tra dữ liệu đầu vào
    if (!data.name || !data.country || !data.season) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    // Tạo giải đấu mới
    const newLeague = new League({
      name: data.name,
      country: data.country,
      season: data.season,
      status: data.status || "active",
      createdBy: session.user.id,
    });

    await newLeague.save();

    return NextResponse.json({
      message: "Giải đấu đã được tạo thành công",
      league: newLeague,
    });
  } catch (error) {
    console.error("Error creating league:", error);
    return NextResponse.json({ error: "Lỗi khi tạo giải đấu mới" }, { status: 500 });
  }
}
