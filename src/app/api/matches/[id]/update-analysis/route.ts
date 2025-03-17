import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Match } from "@/models/Match";
import mongoose from "mongoose";
import { validateApiKey } from "@/lib/n8n-integration";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Kiểm tra API key bảo mật
  const apiKey = request.headers.get("x-api-key");
  if (!validateApiKey(apiKey)) {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 401 });
  }

  try {
    const { id } = params;

    // Kiểm tra id có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID trận đấu không hợp lệ" }, { status: 400 });
    }

    // Đọc dữ liệu từ request
    const data = await request.json();
    const { articles, aiAnalysisContent, predictedScore } = data;

    if (!articles || !Array.isArray(articles) || !aiAnalysisContent) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ, cần có articles và aiAnalysisContent" },
        { status: 400 }
      );
    }

    // Kết nối đến MongoDB
    await connectDB();

    // Tìm trận đấu theo id
    const match = await Match.findById(id);

    if (!match) {
      return NextResponse.json({ error: "Không tìm thấy trận đấu" }, { status: 404 });
    }

    // Cập nhật danh sách bài viết
    match.analysis.articles = articles.map(article => ({
      title: article.title || "",
      url: article.url || "",
      source: article.source || "",
      content: article.content || "",
      fetchedAt: new Date()
    }));

    // Cập nhật bài phân tích AI
    match.analysis.aiAnalysis.content = aiAnalysisContent;
    match.analysis.aiAnalysis.generatedAt = new Date();
    match.analysis.aiAnalysis.status = "generated";

    // Cập nhật dự đoán tỷ số nếu có
    if (predictedScore && typeof predictedScore === 'object') {
      if (predictedScore.home !== undefined) {
        match.analysis.aiAnalysis.predictedScore = {
          home: predictedScore.home,
          away: predictedScore.away || 0
        };
      }
    }

    // Cập nhật trạng thái
    match.analysis.isAnalyzed = true;
    match.analysis.aiStatus = "generated";

    // Lưu thay đổi
    await match.save();

    return NextResponse.json({
      message: "Cập nhật phân tích thành công",
      match: {
        _id: match._id,
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        analysis: {
          isAnalyzed: match.analysis.isAnalyzed,
          aiStatus: match.analysis.aiStatus,
          aiAnalysis: {
            status: match.analysis.aiAnalysis.status
          }
        }
      }
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật phân tích:", error);
    return NextResponse.json(
      { error: "Lỗi khi cập nhật phân tích" },
      { status: 500 }
    );
  }
} 