import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { League } from "@/models/League";
import mongoose from "mongoose";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerAuthSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;

    // Kiểm tra id có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID giải đấu không hợp lệ" }, { status: 400 });
    }

    // Kết nối đến MongoDB
    await connectDB();

    // Tìm giải đấu theo id
    const league = await League.findById(id).lean();

    if (!league) {
      return NextResponse.json({ error: "Không tìm thấy giải đấu" }, { status: 404 });
    }

    return NextResponse.json(league);
  } catch (error) {
    console.error("Error fetching league:", error);
    return NextResponse.json({ error: "Lỗi khi tải thông tin giải đấu" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerAuthSession();

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;

    // Kiểm tra id có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID giải đấu không hợp lệ" }, { status: 400 });
    }

    const data = await request.json();

    // Kiểm tra dữ liệu đầu vào
    if (!data.name || !data.country || !data.season) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    // Kết nối đến MongoDB
    await connectDB();

    // Cập nhật thông tin
    const updateData = {
      name: data.name,
      country: data.country,
      season: data.season,
      status: data.status || "active",
      updatedBy: session.user.id,
      updatedAt: new Date(),
    };

    // Cập nhật giải đấu
    const updatedLeague = await League.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });

    if (!updatedLeague) {
      return NextResponse.json({ error: "Không tìm thấy giải đấu" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Cập nhật giải đấu thành công",
      league: updatedLeague,
    });
  } catch (error) {
    console.error("Error updating league:", error);
    return NextResponse.json({ error: "Lỗi khi cập nhật giải đấu" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerAuthSession();

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;

    // Kiểm tra id có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID giải đấu không hợp lệ" }, { status: 400 });
    }

    // Kết nối đến MongoDB
    await connectDB();

    // Tìm và xóa giải đấu
    const deletedLeague = await League.findByIdAndDelete(id);

    if (!deletedLeague) {
      return NextResponse.json({ error: "Không tìm thấy giải đấu" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Xóa giải đấu thành công",
    });
  } catch (error) {
    console.error("Error deleting league:", error);
    return NextResponse.json({ error: "Lỗi khi xóa giải đấu" }, { status: 500 });
  }
}
