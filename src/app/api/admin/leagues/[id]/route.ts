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

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerAuthSession();

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const league = leagues.find((l) => l._id === id);

  if (!league) {
    return NextResponse.json({ error: "League not found" }, { status: 404 });
  }

  return NextResponse.json(league);
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
    console.log(`Updating league with id ${id}:`, data);

    return NextResponse.json({ message: "League updated successfully" });
  } catch (error) {
    console.error("Error updating league:", error);
    return NextResponse.json({ error: "Failed to update league" }, { status: 500 });
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
    console.log(`Deleting league with id ${id}`);

    return NextResponse.json({ message: "League deleted successfully" });
  } catch (error) {
    console.error("Error deleting league:", error);
    return NextResponse.json({ error: "Failed to delete league" }, { status: 500 });
  }
}
