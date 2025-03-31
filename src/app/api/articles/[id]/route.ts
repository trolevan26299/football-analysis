import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Article } from "@/models/Article";
import { getServerAuthSession } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const session = await getServerAuthSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Kiểm tra id hợp lệ
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "ID không hợp lệ" },
        { status: 400 }
      );
    }

    // Tìm bài phân tích
    const article = await Article.findById(id)
      .populate("matchId", "status venue")
      .select({
        "matchInfo": 1,
        "aiAnalysis": 1,
        "referencedArticles": 1,
        "createdAt": 1,
        "updatedAt": 1,
        "analysisStatus": 1
      });

    if (!article) {
      return NextResponse.json(
        { error: "Không tìm thấy bài phân tích" },
        { status: 404 }
      );
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error("Error fetching article:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 