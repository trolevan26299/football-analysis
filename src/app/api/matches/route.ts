import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Match } from "@/models/Match";

// Define Match type
export interface Match {
  _id: string;
  leagueId: string;
  homeTeam: {
    name: string;
    logo: string;
    score: number;
  };
  awayTeam: {
    name: string;
    logo: string;
    score: number;
  };
  matchDate: string;
  kickoffTime: string;
  venue: {
    name: string;
    city: string;
  };
  status: string;
  round: string;
  analysis: {
    isAnalyzed: boolean;
    articles: Array<{
      title: string;
      url: string;
      source: string;
    }>;
    aiAnalysis: {
      content: string;
      generatedAt: string | null;
      status: string;
    };
    wordpressPost: {
      postId: string;
      status: string;
      publishedAt: string | null;
      url: string;
    };
  };
}

// Mock data
export const matches: Match[] = [
  {
    _id: "1",
    leagueId: "1",
    homeTeam: {
      name: "Manchester United",
      logo: "/logos/mu.png",
      score: 2,
    },
    awayTeam: {
      name: "Liverpool",
      logo: "/logos/liverpool.png",
      score: 1,
    },
    matchDate: "2024-03-15T20:00:00Z",
    kickoffTime: "20:00",
    venue: {
      name: "Old Trafford",
      city: "Manchester",
    },
    status: "scheduled",
    round: "Vòng 28",
    analysis: {
      isAnalyzed: false,
      articles: [],
      aiAnalysis: {
        content: "",
        generatedAt: null,
        status: "pending",
      },
      wordpressPost: {
        postId: "",
        status: "draft",
        publishedAt: null,
        url: "",
      },
    },
  },
  {
    _id: "2",
    leagueId: "2",
    homeTeam: {
      name: "Real Madrid",
      logo: "/logos/real.png",
      score: 3,
    },
    awayTeam: {
      name: "Barcelona",
      logo: "/logos/barca.png",
      score: 2,
    },
    matchDate: "2024-03-16T21:00:00Z",
    kickoffTime: "21:00",
    venue: {
      name: "Santiago Bernabéu",
      city: "Madrid",
    },
    status: "scheduled",
    round: "Vòng 29",
    analysis: {
      isAnalyzed: true,
      articles: [
        {
          title: "El Clásico Preview",
          url: "https://example.com/article1",
          source: "Marca",
        },
      ],
      aiAnalysis: {
        content: "Phân tích trận đấu...",
        generatedAt: "2024-03-14T10:00:00Z",
        status: "generated",
      },
      wordpressPost: {
        postId: "123",
        status: "published",
        publishedAt: "2024-03-14T11:00:00Z",
        url: "https://example.com/post/123",
      },
    },
  },
];

export async function GET() {
  const session = await getServerAuthSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Kết nối đến MongoDB
    await connectDB();

    // Lấy danh sách trận đấu từ cơ sở dữ liệu
    const matches = await Match.find().sort({ matchDate: -1 }).lean();

    return NextResponse.json(matches);
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json({ error: "Lỗi khi tải dữ liệu trận đấu" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerAuthSession();

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();

    // Kết nối đến MongoDB
    await connectDB();

    // Xác thực dữ liệu đầu vào
    if (!data.leagueId || !data.homeTeamName || !data.awayTeamName || !data.matchDate) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    // Định dạng dữ liệu
    const matchData = {
      leagueId: data.leagueId,
      homeTeam: {
        name: data.homeTeamName,
        logo: data.homeTeamLogo || `/logos/${data.homeTeamName.toLowerCase().replace(/\s+/g, "")}.png`, // Tạo đường dẫn logo mặc định
        score: 0,
      },
      awayTeam: {
        name: data.awayTeamName,
        logo: data.awayTeamLogo || `/logos/${data.awayTeamName.toLowerCase().replace(/\s+/g, "")}.png`, // Tạo đường dẫn logo mặc định
        score: 0,
      },
      matchDate: new Date(data.matchDate),
      kickoffTime: data.kickoffTime || "00:00",
      venue: {
        name: data.venueName || "",
        city: data.venueCity || "",
      },
      status: data.status || "scheduled",
      round: data.round || "",
      createdBy: session.user.id,
    };

    // Tạo trận đấu mới
    const newMatch = new Match(matchData);
    await newMatch.save();

    return NextResponse.json({
      message: "Trận đấu đã được tạo thành công",
      match: newMatch,
    });
  } catch (error) {
    console.error("Error creating match:", error);
    return NextResponse.json({ error: "Lỗi khi tạo trận đấu mới" }, { status: 500 });
  }
}
