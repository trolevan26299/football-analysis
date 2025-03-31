import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Match } from "@/models/Match";
import { MiddlewareService } from "@/lib/middleware";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Xác thực người dùng admin hoặc ktv
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

    // Tìm trận đấu cần phân tích
    const match = await Match.findById(id);
    if (!match) {
      return NextResponse.json(
        { error: "Không tìm thấy trận đấu" },
        { status: 404 }
      );
    }

    // Kiểm tra trạng thái phân tích
    if (match.analysisInfo.isAnalyzed) {
      return NextResponse.json(
        { error: "Trận đấu này đã được phân tích" },
        { status: 400 }
      );
    }

    // Cập nhật thông tin phân tích
    match.analysisInfo = {
      isAnalyzed: true,
      analysisStatus: "analyzed"
    };

    // Lưu thay đổi
    await match.save();

    // Trong thực tế, bạn có thể bắt đầu một quy trình phân tích bất đồng bộ ở đây
    // Ví dụ: gửi tin nhắn đến hàng đợi để xử lý phân tích trong background
    // await queueAnalysisJob(id);

    return NextResponse.json({
      message: "Đã bắt đầu phân tích trận đấu",
      matchId: id
    });
  } catch (error) {
    return MiddlewareService.handleError(error, "Lỗi khi bắt đầu phân tích trận đấu");
  }
} 