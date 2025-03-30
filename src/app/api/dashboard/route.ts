import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Match } from "@/models/Match";
import { User } from "@/models/User";
import { League } from "@/models/League";
import mongoose from "mongoose";

// Định nghĩa interface cho dữ liệu match trong database
interface MatchDocument {
  _id: mongoose.Types.ObjectId;
  homeTeam: {
    name: string;
    logo?: string;
    score?: number;
  };
  awayTeam: {
    name: string;
    logo?: string;
    score?: number;
  };
  matchDate: Date | string;
  status: string;
  analysis?: {
    isAnalyzed: boolean;
    wordpressPost?: {
      status: string;
      publishedAt?: string;
    };
    aiAnalysis?: {
      generatedAt?: string;
    };
  };
}

// Định nghĩa interface cho dữ liệu dashboard
interface DashboardData {
  totalMatches: number;
  pendingAnalysis: number;
  totalArticles: number;
  totalUsers: number;
  recentMatches: Array<{
    id: string;
    homeTeam: string;
    awayTeam: string;
    date: Date | string;
    status: string;
  }>;
  recentArticles: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: Date | string | null;
  }>;
  totalLeagues: number;
  activeLeagues: number;
}

// Cache invalidation thời gian thực
let lastFetchTime = Date.now();
let cachedData: DashboardData | null = null;
const CACHE_TTL = 60000; // 60 giây

export async function GET() {
  const session = await getServerAuthSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Sử dụng cache nếu có và còn hiệu lực
    const now = Date.now();
    if (cachedData && (now - lastFetchTime < CACHE_TTL)) {
      // Trả về dữ liệu cache để tăng tốc
      return new NextResponse(JSON.stringify(cachedData), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'private, max-age=60',
          'X-Cache': 'HIT'
        }
      });
    }

    // Kết nối MongoDB
    await connectDB();

    // Tối ưu hóa các truy vấn MongoDB
    const [matchesData, users, leagues] = await Promise.all([
      Match.find({}, { 
        'homeTeam.name': 1, 
        'awayTeam.name': 1, 
        'matchDate': 1, 
        'status': 1, 
        'analysis.isAnalyzed': 1,
        'analysis.wordpressPost.status': 1,
        'analysis.wordpressPost.publishedAt': 1,
        'analysis.aiAnalysis.generatedAt': 1
      })
      .sort({ matchDate: -1 })
      .limit(100)
      .lean(),
      
      User.find({ role: "ktv" }, { _id: 1 })
      .lean(),
      
      League.find({}, { status: 1 })
      .lean(),
    ]);

    // Ép kiểu dữ liệu để TypeScript hiểu
    const matches = matchesData as unknown as MatchDocument[];

    // Tính toán các thống kê
    const totalMatches = matches.length;
    const pendingAnalysis = matches.filter((match) => match.analysis && !match.analysis.isAnalyzed).length;

    // Tính tổng số bài viết
    const totalArticles = matches.filter(
      (match) =>
        match.analysis && match.analysis.isAnalyzed && match.analysis.wordpressPost && match.analysis.wordpressPost.status === "published"
    ).length;

    // Số lượng KTV
    const totalUsers = users.length;

    // Lấy 5 trận đấu gần nhất
    const recentMatches = matches
      .slice(0, 5)
      .map((match) => ({
        id: match._id.toString(),
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
        id: match._id.toString(),
        title: `Phân tích: ${match.homeTeam.name} vs ${match.awayTeam.name}`,
        status: match.analysis?.wordpressPost?.status || "draft",
        createdAt: match.analysis?.wordpressPost?.publishedAt || match.analysis?.aiAnalysis?.generatedAt || null,
      }));

    // Tổng hợp dữ liệu dashboard
    const dashboardStats: DashboardData = {
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

    // Cập nhật cache
    cachedData = dashboardStats;
    lastFetchTime = now;

    // Cài đặt header cache-control để tối ưu hiệu suất
    return new NextResponse(JSON.stringify(dashboardStats), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=60',
        'X-Cache': 'MISS'
      }
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Không thể lấy dữ liệu dashboard" }, { status: 500 });
  }
}
