import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Match } from "@/models/Match";
import { MiddlewareService } from "@/lib/middleware";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Xác thực người dùng
    const authError = await MiddlewareService.verifyUserRole(["admin", "ktv"]);
    if (authError) return authError;

    // Lấy ID trận đấu từ params
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: "ID trận đấu không hợp lệ" },
        { status: 400 }
      );
    }

    // Kết nối database
    await connectDB();

    // Tìm trận đấu
    const match = await Match.findById(id).populate("leagueId", "name");
    if (!match) {
      return NextResponse.json(
        { error: "Không tìm thấy trận đấu" },
        { status: 404 }
      );
    }

    // Format dữ liệu trả về
    const formattedMatch = {
      ...match.toObject(),
      league: {
        _id: match.leagueId?._id,
        name: match.leagueId?.name || "N/A"
      }
    };

    return NextResponse.json(formattedMatch);
  } catch (error) {
    console.error("Error fetching match:", error);
    return MiddlewareService.handleError(error, "Lỗi khi lấy thông tin trận đấu");
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Xác thực người dùng admin
    const authError = await MiddlewareService.verifyUserRole(["admin"]);
    if (authError) return authError;

    // Lấy ID trận đấu từ params
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: "ID trận đấu không hợp lệ" },
        { status: 400 }
      );
    }

    // Kết nối database
    await connectDB();

    // Lấy dữ liệu từ request body
    const data = await req.json();    
    const { leagueId, homeTeamName, awayTeamName, matchDate, status } = data;

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

    // Tìm trận đấu và cập nhật
    const existingMatch = await Match.findById(id);
    if (!existingMatch) {
      return NextResponse.json(
        { error: "Không tìm thấy trận đấu" },
        { status: 404 }
      );
    }

    // Cập nhật trận đấu
    existingMatch.leagueId = leagueId;
    existingMatch.homeTeam.name = homeTeamName;
    existingMatch.awayTeam.name = awayTeamName;
    existingMatch.matchDate = formattedMatchDate;
    
    // Cập nhật trạng thái nếu có
    if (status && ["scheduled", "finished"].includes(status)) {
      existingMatch.status = status;
    }
    
    // Lưu thay đổi
    await existingMatch.save();

    return NextResponse.json(
      { message: "Cập nhật trận đấu thành công", match: existingMatch },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating match:", error);
    return MiddlewareService.handleError(error, "Lỗi khi cập nhật trận đấu");
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Xác thực người dùng admin
    const authError = await MiddlewareService.verifyUserRole(["admin"]);
    if (authError) return authError;

    // Lấy ID trận đấu từ params
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: "ID trận đấu không hợp lệ" },
        { status: 400 }
      );
    }

    // Kết nối database
    await connectDB();

    // Xóa trận đấu
    const result = await Match.findByIdAndDelete(id);
    if (!result) {
      return NextResponse.json(
        { error: "Không tìm thấy trận đấu" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Xóa trận đấu thành công" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting match:", error);
    return MiddlewareService.handleError(error, "Lỗi khi xóa trận đấu");
  }
}

