import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Match } from "@/models/Match";
import { getServerAuthSession } from "@/lib/auth";

export async function GET() {
  const session = await getServerAuthSession();

  if (!session) {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 401 });
  }

  try {
    // Kết nối đến MongoDB
    await connectDB();
    
    // Lấy ngày hiện tại
    const currentDate = new Date();
    
    // Lấy danh sách trận đấu sắp diễn ra
    const upcomingMatches = await Match.find({
      matchDate: { $gt: currentDate },
      status: "scheduled"
    })
    .sort({ matchDate: 1 })
    .populate("leagueId", "name country season")
    .lean();
    
    return NextResponse.json(upcomingMatches);
  } catch (error) {
    console.error("Lỗi khi tải danh sách trận đấu sắp diễn ra:", error);
    return NextResponse.json(
      { error: "Lỗi khi tải danh sách trận đấu sắp diễn ra" },
      { status: 500 }
    );
  }
} 