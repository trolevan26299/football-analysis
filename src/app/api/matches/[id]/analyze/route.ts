import { MatchService } from "@/lib/api";
import { MiddlewareService } from "@/lib/middleware";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Xác thực người dùng với vai trò admin hoặc ktv
    const authError = await MiddlewareService.verifyUserRole(["admin", "ktv"]);
    if (authError) return authError;

    const { id } = params;
    
    try {
      // Sử dụng MatchService để bắt đầu phân tích
      const match = await MatchService.startAnalysis(id);
      
      // TODO: Thêm logic phân tích trận đấu ở đây
      console.log(`Bắt đầu phân tích trận đấu ${match._id}`);
      
      // Trả về kết quả đã được format
      return MiddlewareService.successResponse(
        "Quá trình phân tích đã bắt đầu",
        { match: MatchService.formatAnalysisResult(match) }
      );
      
    } catch (error) {
      // Xử lý lỗi từ service
      return MiddlewareService.handleError(
        error, 
        "Lỗi khi phân tích trận đấu",
        400
      );
    }
    
  } catch (error) {
    // Xử lý lỗi chung
    return MiddlewareService.handleError(
      error,
      "Lỗi khi bắt đầu quá trình phân tích"
    );
  }
} 