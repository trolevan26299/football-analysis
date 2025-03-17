import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Match } from "@/models/Match";
import mongoose from "mongoose";
import { triggerAnalysis } from "@/lib/n8n-integration";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerAuthSession();

  if (!session || !["admin", "ktv"].includes(session.user.role)) {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 401 });
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
    const match = await Match.findById(id);

    if (!match) {
      return NextResponse.json({ error: "Không tìm thấy trận đấu" }, { status: 404 });
    }

    // Kiểm tra trạng thái trận đấu
    if (match.analysis.aiStatus === "processing") {
      return NextResponse.json({ error: "Trận đấu đang được phân tích" }, { status: 400 });
    }

    if (match.analysis.aiStatus === "generated") {
      return NextResponse.json({ error: "Trận đấu đã được phân tích" }, { status: 400 });
    }

    // Cập nhật trạng thái đang xử lý
    match.analysis.aiStatus = "processing";
    match.analysis.aiAnalysis.status = "generating";
    await match.save();
    
    // Gọi n8n webhook để bắt đầu quy trình phân tích
    await triggerAnalysis(match);
    
    return NextResponse.json({ 
      message: "Quá trình phân tích đã bắt đầu",
      match: {
        _id: match._id,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        analysis: {
          aiStatus: match.analysis.aiStatus,
          aiAnalysis: {
            status: match.analysis.aiAnalysis.status
          }
        }
      }
    });
  } catch (error) {
    console.error("Lỗi khi bắt đầu phân tích:", error);
    return NextResponse.json(
      { error: "Lỗi khi bắt đầu quá trình phân tích" },
      { status: 500 }
    );
  }
} 