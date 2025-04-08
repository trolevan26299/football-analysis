FROM node:20-alpine AS base

# Thư mục làm việc
WORKDIR /app

# Sao chép package.json và package-lock.json
FROM base AS dependencies
COPY package*.json ./
RUN npm ci

# Build ứng dụng
FROM dependencies AS builder
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Tạo user không phải root để chạy ứng dụng
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Sao chép các file cần thiết từ builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Chuyển quyền sở hữu cho người dùng nextjs
RUN chown -R nextjs:nodejs /app

# Chuyển sang người dùng nextjs
USER nextjs

# Mở cổng 3000
EXPOSE 3000

# Biến môi trường mặc định
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Chạy ứng dụng
CMD ["node", "server.js"] 