import { NextResponse } from "next/server";
import { getServerAuthSession } from "./auth";
import config from "@/config";

export const MiddlewareService = {
 
 // Xác thực người dùng dựa trên vai trò
  async verifyUserRole(requiredRoles: string[] = ["admin"]) {
    const session = await getServerAuthSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Không có quyền truy cập, cần đăng nhập" },
        { status: 401 }
      );
    }
    
    if (!requiredRoles.includes(session.user.role)) {
      return NextResponse.json(
        { error: `Không có quyền truy cập, cần quyền ${requiredRoles.join(' hoặc ')}` },
        { status: 403 }
      );
    }
    
    return undefined;
  },
  
  // Xác thực API key từ request header
  verifyApiKey(apiKey: string | null) {
    const { apiKey: configApiKey } = config.api;
    
    if (!configApiKey) {
      console.warn("API_KEY không được cấu hình");
      return NextResponse.json(
        { error: "Lỗi cấu hình server" },
        { status: 500 }
      );
    }
    
    if (!apiKey || apiKey !== configApiKey) {
      console.warn("API key không hợp lệ");
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 401 }
      );
    }
    
    return undefined;
  },
  
  // Xử lý lỗi trong API routes
  handleError(error: unknown, defaultMessage = "Lỗi server", status = 500) {
    // Ghi log lỗi với thông tin môi trường
    console.error(`API Error [${config.app.environment}]:`, error);
    
    // Kiểm tra loại lỗi để đưa ra thông báo phù hợp
    if (error instanceof Error) {
      if (error.message.includes("ID trận đấu không hợp lệ")) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
      
      if (error.message.includes("Không tìm thấy")) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
      
      if (error.message.includes("không hợp lệ") || 
          error.message.includes("đang được phân tích") ||
          error.message.includes("đã được phân tích")) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
      
      // Trả về message của Error
      return NextResponse.json(
        { error: error.message },
        { status }
      );
    }
    
    // Trường hợp mặc định
    return NextResponse.json(
      { error: defaultMessage },
      { status }
    );
  },
  
  // Log một thông báo và trả về NextResponse
  successResponse<T>(message: string, data: T, status = 200) {
    console.log(`[${config.app.environment}] ${message}`);
    return NextResponse.json(
      { message, ...data },
      { status }
    );
  }
}; 