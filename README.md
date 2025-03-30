# Football Analysis

Ứng dụng phân tích bóng đá sử dụng Next.js và MongoDB.

## Tính năng

- Quản lý giải đấu, đội bóng và trận đấu
- Phân tích trận đấu tự động
- Dự đoán kết quả trận đấu
- Authentication và phân quyền người dùng

## Yêu cầu

- Node.js 18+
- MongoDB

## Cài đặt

1. Clone repository:
```bash
git clone <repository-url>
cd football-analysis
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Cấu hình biến môi trường:
- Tạo file `.env` từ `.env.example` và cấu hình MongoDB URI, NextAuth secret...

4. Khởi động ứng dụng:
```bash
npm run dev
```

## Cấu trúc dự án

```
football-analysis/
├── src/
│   ├── app/               # Next.js App Router
│   ├── components/        # React components
│   ├── lib/               # Utility libraries
│   └── models/            # MongoDB schema models
└── public/                # Static assets
```

## API Routes

### Phân tích trận đấu

- `POST /api/matches/[id]/analyze`: Bắt đầu phân tích trận đấu
- `POST /api/matches/[id]/update-analysis`: Cập nhật kết quả phân tích

## Phát triển

```bash
# Chạy ứng dụng ở chế độ development
npm run dev
```

## Giấy phép

Copyright © 2023. Bản quyền thuộc về đội phát triển.
