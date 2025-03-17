/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";

// Mock data
const leagues = [
  {
    _id: "1",
    name: "Premier League",
    country: "Anh",
    season: "2023-2024",
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    _id: "2",
    name: "La Liga",
    country: "Tây Ban Nha",
    season: "2023-2024",
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    _id: "3",
    name: "Serie A",
    country: "Ý",
    season: "2023-2024",
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    _id: "4",
    name: "Bundesliga",
    country: "Đức",
    season: "2023-2024",
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    _id: "5",
    name: "Ligue 1",
    country: "Pháp",
    season: "2023-2024",
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

export async function GET() {
  const session = await getServerAuthSession();

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(leagues);
}

export async function POST(request: Request) {
  const session = await getServerAuthSession();

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // const data = await request.json();
  // Add validation and save to database logic here

  return NextResponse.json({ message: "League created successfully" });
}
