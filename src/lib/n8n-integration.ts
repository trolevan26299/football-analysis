import axios from "axios";

// Lấy các biến môi trường
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || "";
const N8N_API_KEY = process.env.N8N_API_KEY || "";

/**
 * Hàm gọi workflow n8n để phân tích trận đấu
 * @param match Thông tin trận đấu cần phân tích
 */
export async function triggerAnalysis(match: any) {
  try {
    if (!N8N_WEBHOOK_URL) {
      throw new Error("N8N_WEBHOOK_URL không được cấu hình");
    }

    // Chuẩn bị dữ liệu để gửi đến n8n
    const payload = {
      matchId: match._id.toString(),
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      matchDate: match.matchDate,
      leagueId: match.leagueId.toString(),
      apiKey: N8N_API_KEY
    };
    
    // Gọi webhook n8n để bắt đầu quy trình
    console.log("Gọi webhook n8n:", N8N_WEBHOOK_URL);
    const response = await axios.post(N8N_WEBHOOK_URL, payload);
    
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi n8n workflow:", error);
    throw error;
  }
}

/**
 * Xác thực API key từ request n8n
 * @param apiKey API key từ request headers
 * @returns Boolean cho biết API key có hợp lệ không
 */
export function validateApiKey(apiKey: string | null) {
  if (!N8N_API_KEY) {
    console.warn("N8N_API_KEY không được cấu hình");
    return false;
  }
  
  return apiKey === N8N_API_KEY;
} 