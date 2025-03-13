import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Match } from "@/models/Match";
import mongoose from "mongoose";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerAuthSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;

    // Kiểm tra id có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID trận đấu không hợp lệ" }, { status: 400 });
    }

    // Kết nối đến MongoDB
    await connectDB();

    // Tìm trận đấu theo id
    const match = await Match.findById(id).lean();

    if (!match) {
      return NextResponse.json({ error: "Không tìm thấy trận đấu" }, { status: 404 });
    }

    return NextResponse.json(match);
  } catch (error) {
    console.error("Error fetching match:", error);
    return NextResponse.json({ error: "Lỗi khi tải thông tin trận đấu" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerAuthSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;

    // Kiểm tra id có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID trận đấu không hợp lệ" }, { status: 400 });
    }

    const data = await request.json();

    // Kết nối đến MongoDB
    await connectDB();

    // Tìm trận đấu hiện tại
    const existingMatch = await Match.findById(id);

    if (!existingMatch) {
      return NextResponse.json({ error: "Không tìm thấy trận đấu" }, { status: 404 });
    }

    // Cập nhật thông tin
    const updateData = {
      leagueId: data.leagueId,
      homeTeam: {
        name: data.homeTeamName,
        logo: existingMatch.homeTeam.logo, // Giữ nguyên logo cũ
        score: data.homeTeamScore !== undefined ? data.homeTeamScore : existingMatch.homeTeam.score,
      },
      awayTeam: {
        name: data.awayTeamName,
        logo: existingMatch.awayTeam.logo, // Giữ nguyên logo cũ
        score: data.awayTeamScore !== undefined ? data.awayTeamScore : existingMatch.awayTeam.score,
      },
      matchDate: data.matchDate ? new Date(data.matchDate) : existingMatch.matchDate,
      kickoffTime: data.kickoffTime || existingMatch.kickoffTime,
      venue: {
        name: data.venueName || existingMatch.venue.name,
        city: data.venueCity || existingMatch.venue.city,
      },
      status: data.status || existingMatch.status,
      round: data.round || existingMatch.round,
      updatedBy: session.user.id,
      updatedAt: new Date(),
    };

    // Cập nhật trận đấu
    const updatedMatch = await Match.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });

    return NextResponse.json({
      message: "Cập nhật trận đấu thành công",
      match: updatedMatch,
    });
  } catch (error) {
    console.error("Error updating match:", error);
    return NextResponse.json({ error: "Lỗi khi cập nhật trận đấu" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerAuthSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Kiểm tra quyền admin
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Chỉ admin mới có thể xóa trận đấu" }, { status: 403 });
  }

  try {
    const { id } = params;

    // Kiểm tra id có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID trận đấu không hợp lệ" }, { status: 400 });
    }

    // Kết nối đến MongoDB
    await connectDB();

    // Tìm và xóa trận đấu
    const deletedMatch = await Match.findByIdAndDelete(id);

    if (!deletedMatch) {
      return NextResponse.json({ error: "Không tìm thấy trận đấu" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Xóa trận đấu thành công",
    });
  } catch (error) {
    console.error("Error deleting match:", error);
    return NextResponse.json({ error: "Lỗi khi xóa trận đấu" }, { status: 500 });
  }
}
