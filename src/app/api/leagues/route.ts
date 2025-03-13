import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { League } from "@/models/League";

// Define League type
export interface League {
  _id: string;
  name: string;
  country: string;
  season: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Mock data
export const leagues: League[] = [
  {
    _id: "1",
    name: "Premier League",
    country: "England",
    season: "2023-2024",
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    _id: "2",
    name: "La Liga",
    country: "Spain",
    season: "2023-2024",
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

export async function GET() {
  const session = await getServerAuthSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Kết nối MongoDB
    console.log("Attempting to connect to MongoDB...");
    await connectDB();
    console.log("MongoDB connection successful");

    // Lấy danh sách giải đấu từ cơ sở dữ liệu
    console.log("Fetching leagues from database...");
    const leagues = await League.find().sort({ createdAt: -1 }).lean();
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
