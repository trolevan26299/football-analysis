import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Match } from "@/models/Match";
import { MiddlewareService } from "@/lib/middleware";

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
    const matches = await Match.find()
      .sort({ matchDate: -1 })
      .populate("leagueId", "name country season")
      .lean();

    return NextResponse.json(matches);
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json({ error: "Lỗi khi tải dữ liệu trận đấu" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Xác thực người dùng admin
    const authError = await MiddlewareService.verifyUserRole(["admin"]);
    if (authError) return authError;

    // Kết nối database
    await connectDB();

    // Lấy dữ liệu từ request
    const session = await getServerAuthSession();
    const data = await req.json();
    
    // Lấy các trường từ data
    const { leagueId, homeTeamName, awayTeamName, matchDate } = data;
    
    // Kiểm tra các trường bắt buộc
    if (!leagueId || !homeTeamName || !awayTeamName || !matchDate) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc" },
        { status: 400 }
      );
    }

    // Chuyển đổi matchDate thành định dạng ISO Date nếu chưa phải
    let formattedMatchDate;
    try {
      formattedMatchDate = new Date(matchDate);
      if (isNaN(formattedMatchDate.getTime())) {
        throw new Error("Ngày không hợp lệ");
      }
    } catch (err) {
      console.error("Invalid date format:", err);
      return NextResponse.json(
        { error: "Định dạng ngày không hợp lệ" },
        { status: 400 }
      );
    }

    // Chuẩn bị dữ liệu trận đấu
    const matchData = {
      leagueId,
      homeTeam: {
        name: homeTeamName,
        logo: "",
        score: 0,
      },
      awayTeam: {
        name: awayTeamName,
        logo: "",
        score: 0,
      },
      matchDate: formattedMatchDate,
      status: "scheduled",
      analysisInfo: {
        isAnalyzed: false,
        analysisStatus: "not_analyzed"
      },
      createdBy: session?.user?.id,
    };

    // Tạo trận đấu mới
    const newMatch = await Match.create(matchData);

    return NextResponse.json(
      { message: "Tạo trận đấu thành công", match: newMatch },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating match:", error);
    return MiddlewareService.handleError(error, "Lỗi khi tạo trận đấu");
  }
}

export async function PUT(req: Request) {
  try {
    // Xác thực người dùng admin
    const authError = await MiddlewareService.verifyUserRole(["admin"]);
    if (authError) return authError;

    // Kết nối database
    await connectDB();

    // Lấy dữ liệu từ request
    const session = await getServerAuthSession();
    const { id, leagueId, homeTeamName, awayTeamName, matchDate } = await req.json();

    // Kiểm tra ID
    if (!id) {
      return NextResponse.json(
        { error: "ID trận đấu không hợp lệ" },
        { status: 400 }
      );
    }

    // Tìm trận đấu cần cập nhật
    const existingMatch = await Match.findById(id);
    if (!existingMatch) {
      return NextResponse.json(
        { error: "Không tìm thấy trận đấu" },
        { status: 404 }
      );
    }

    // Cập nhật thông tin
    if (leagueId) existingMatch.leagueId = leagueId;
    if (homeTeamName) existingMatch.homeTeam.name = homeTeamName;
    if (awayTeamName) existingMatch.awayTeam.name = awayTeamName;
    if (matchDate) existingMatch.matchDate = matchDate;
    
    existingMatch.updatedBy = session?.user?.id;

    // Lưu thay đổi
    await existingMatch.save();

    return NextResponse.json(
      { message: "Cập nhật trận đấu thành công", match: existingMatch }
    );
  } catch (error) {
    return MiddlewareService.handleError(error, "Lỗi khi cập nhật trận đấu");
  }
}
