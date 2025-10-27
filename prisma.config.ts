import fs from "fs";
import path from "path";
import { defineConfig } from "prisma/config";
import dotenv from "dotenv";

// ----------------------------------------------------
// 1. 安全載入 .env（支援 AWS EC2、PM2、CLI）
// ----------------------------------------------------
const envPath = path.resolve(process.cwd(), ".env");

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log(`Loaded environment variables from ${envPath}`);
} else {
  console.warn(`Warning: .env file not found at ${envPath}`);
}

// ----------------------------------------------------
// 2. 檢查 DATABASE_URL 是否存在
// ----------------------------------------------------
if (!process.env.DATABASE_URL) {
  throw new Error(
    "Missing DATABASE_URL in environment variables.\n" +
      "Please ensure your .env file includes:\n" +
      'DATABASE_URL="postgresql://postgres:K.o1234@localhost:5432/booksdb?schema=public"\n'
  );
}

// ----------------------------------------------------
// 3. 定義 Prisma 設定
// ----------------------------------------------------
export default defineConfig({
  schema: "prisma/schema.prisma", // 你的 Prisma schema 路徑
  migrations: {
    path: "prisma/migrations", // migration 資料夾
  },
  engine: "classic",
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
