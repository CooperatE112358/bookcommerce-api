# BookCommerce API

Swagger : http://localhost:5000/api/v1/api-docs

一個以 Express + Prisma + PostgreSQL 建置的電商後端 API，整合 Google Books 資料作為商品來源，支援使用者、訂單與評論等核心功能，並提供 Swagger API 文件。部署於 AWS EC2，使用 PM2 管理。

## 功能特性

- 使用者註冊 / 登入（JWT）
- 商品（書籍）CRUD + Google Books 整合
- 訂單與評論系統
- Swagger 文件 + 健康檢查
- AWS EC2 + PM2 部署支援

## 技術棧

- Node.js + Express
- Prisma ORM + PostgreSQL
- JWT + Cookie 驗證
- Swagger UI / OpenAPI 3
- PM2 + AWS EC2

## 安裝與執行

```bash
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run dev
```
