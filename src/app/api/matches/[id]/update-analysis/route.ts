import { MatchService } from "@/lib/api";
import { MiddlewareService } from "@/lib/middleware";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Kiểm tra API key
    const apiKey = request.headers.get("x-api-key");
    const authError = MiddlewareService.verifyApiKey(apiKey);
    if (authError) return authError;

    const { id } = params;

    try {
      // Đọc dữ liệu từ request
      const data = await request.json();
      
      // Sử dụng MatchService để cập nhật phân tích
      const match = await MatchService.updateAnalysis(id, data);
      
      // Trả về kết quả thành công
      return MiddlewareService.successResponse(
        "Cập nhật phân tích thành công",
        { match: MatchService.formatAnalysisResult(match) }
      );
      
    } catch (error) {
      // Xử lý lỗi từ service
      return MiddlewareService.handleError(
        error,
        "Lỗi khi cập nhật phân tích trận đấu",
        400
      );
    }
  } catch (error) {
    // Xử lý lỗi chung
    return MiddlewareService.handleError(
      error,
      "Lỗi khi xử lý yêu cầu cập nhật phân tích"
    );
  }
} 