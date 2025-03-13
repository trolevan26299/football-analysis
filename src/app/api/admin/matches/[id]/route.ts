import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";

// Mock data - giống dữ liệu trong matches route
const matches = [
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

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerAuthSession();

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const match = matches.find((m) => m._id === id);

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  return NextResponse.json(match);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerAuthSession();

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    const data = await request.json();

    // Trong thực tế, đây sẽ là logic cập nhật trong database
    console.log(`Updating match with id ${id}:`, data);

    return NextResponse.json({ message: "Match updated successfully" });
  } catch (error) {
    console.error("Error updating match:", error);
    return NextResponse.json({ error: "Failed to update match" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerAuthSession();

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;

    // Trong thực tế, đây sẽ là logic xóa trong database
    console.log(`Deleting match with id ${id}`);

    return NextResponse.json({ message: "Match deleted successfully" });
  } catch (error) {
    console.error("Error deleting match:", error);
    return NextResponse.json({ error: "Failed to delete match" }, { status: 500 });
  }
}
