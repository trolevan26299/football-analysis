import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Match } from "@/models/Match";

// Define Match type (không export)


export async function GET() {
  const session = await getServerAuthSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Kết nối đến MongoDB
    await connectDB();

    // Lấy danh sách trận đấu từ cơ sở dữ liệu
    const matches = await Match.find().sort({ matchDate: -1 }).lean();

    return NextResponse.json(matches);
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json({ error: "Lỗi khi tải dữ liệu trận đấu" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerAuthSession();

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();

    // Kết nối đến MongoDB
    await connectDB();

    // Xác thực dữ liệu đầu vào
    if (!data.leagueId || !data.homeTeamName || !data.awayTeamName || !data.matchDate) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    // Định dạng dữ liệu
    const matchData = {
      leagueId: data.leagueId,
      homeTeam: {
        name: data.homeTeamName,
        logo: data.homeTeamLogo || `/logos/${data.homeTeamName.toLowerCase().replace(/\s+/g, "")}.png`, // Tạo đường dẫn logo mặc định
        score: 0,
      },
      awayTeam: {
        name: data.awayTeamName,
        logo: data.awayTeamLogo || `/logos/${data.awayTeamName.toLowerCase().replace(/\s+/g, "")}.png`, // Tạo đường dẫn logo mặc định
        score: 0,
      },
      matchDate: new Date(data.matchDate),
      kickoffTime: data.kickoffTime || "00:00",
      venue: {
        name: data.venueName || "",
        city: data.venueCity || "",
      },
      status: data.status || "scheduled",
      round: data.round || "",
      createdBy: session.user.id,
    };

    // Tạo trận đấu mới
    const newMatch = new Match(matchData);
    await newMatch.save();

    return NextResponse.json({
      message: "Trận đấu đã được tạo thành công",
      match: newMatch,
    });
  } catch (error) {
    console.error("Error creating match:", error);
    return NextResponse.json({ error: "Lỗi khi tạo trận đấu mới" }, { status: 500 });
  }
}
