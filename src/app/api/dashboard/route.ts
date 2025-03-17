import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Match } from "@/models/Match";
import { User } from "@/models/User";
import { League } from "@/models/League";

export async function GET() {
  const session = await getServerAuthSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Kết nối MongoDB
    await connectDB();

    // Lấy dữ liệu từ MongoDB
    const [matches, users, leagues] = await Promise.all([
      Match.find().lean(),
      User.find({ role: "ktv" }).lean(),
      League.find().lean(),
    ]);

    // Tính toán các thống kê
    const totalMatches = matches.length;
    const pendingAnalysis = matches.filter((match) => match.analysis && !match.analysis.isAnalyzed).length;

    // Tính tổng số bài viết (số trận đấu đã phân tích)
    const totalArticles = matches.filter(
      (match) =>
        match.analysis && match.analysis.isAnalyzed && match.analysis.wordpressPost && match.analysis.wordpressPost.status === "published"
    ).length;

    // Số lượng KTV
    const totalUsers = users.length;

    // Lấy 5 trận đấu gần nhất
    const recentMatches = matches
      .sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime())
      .slice(0, 5)
      .map((match) => ({
        id: match._id,
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        date: match.matchDate,
        status: match.status,
      }));

    // Tạo danh sách bài viết gần đây từ trận đấu có bài viết
    const articlesFromMatches = matches
      .filter((match) => match.analysis && match.analysis.isAnalyzed)
      .sort((a, b) => {
        const dateA = a.analysis?.wordpressPost?.publishedAt
          ? new Date(a.analysis?.wordpressPost?.publishedAt)
          : new Date(a.analysis?.aiAnalysis?.generatedAt || Date.now());
        const dateB = b.analysis?.wordpressPost?.publishedAt
          ? new Date(b.analysis?.wordpressPost?.publishedAt)
          : new Date(b.analysis?.aiAnalysis?.generatedAt || Date.now());
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 5)
      .map((match) => ({
        id: match._id,
        title: `Phân tích: ${match.homeTeam.name} vs ${match.awayTeam.name}`,
        status: match.analysis?.wordpressPost?.status || "draft",
        createdAt: match.analysis?.wordpressPost?.publishedAt || match.analysis?.aiAnalysis?.generatedAt,
      }));

    // Tổng hợp dữ liệu dashboard
    const dashboardStats = {
      totalMatches,
      pendingAnalysis,
      totalArticles,
      totalUsers,
      recentMatches,
      recentArticles: articlesFromMatches,
      // Bao gồm thông tin liên quan đến giải đấu
      totalLeagues: leagues.length,
      activeLeagues: leagues.filter((league) => league.status === "active").length,
    };

    return NextResponse.json(dashboardStats);
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Không thể lấy dữ liệu dashboard" }, { status: 500 });
  }
}
