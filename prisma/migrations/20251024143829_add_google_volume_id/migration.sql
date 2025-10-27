/*
  Warnings:

  - You are about to drop the column `averageRating` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `currencyCode` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `gbooksVolumeId` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `isEbook` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `isbn10` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `isbn13` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `listPrice` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `publishedDateRaw` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `publishedYear` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `publisher` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `ratingsCount` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `smallThumbnailUrl` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `subtitle` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnailUrl` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `currencyCode` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `shippingAddress` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `shippingName` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `shippingPhone` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `Order` table. All the data in the column will be lost.
  - The `status` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `OrderItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `currencyCode` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `unitPrice` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHash` on the `User` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Author` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BookAuthor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BookCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[googleVolumeId]` on the table `Book` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `inventory` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientSecret` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingFee` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tax` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `OrderItem` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `name` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `comment` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Made the column `title` on table `Review` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- DropForeignKey
ALTER TABLE "public"."BookAuthor" DROP CONSTRAINT "BookAuthor_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BookAuthor" DROP CONSTRAINT "BookAuthor_bookId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BookCategory" DROP CONSTRAINT "BookCategory_bookId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BookCategory" DROP CONSTRAINT "BookCategory_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Review" DROP CONSTRAINT "Review_bookId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Review" DROP CONSTRAINT "Review_userId_fkey";

-- DropIndex
DROP INDEX "public"."Book_averageRating_idx";

-- DropIndex
DROP INDEX "public"."Book_gbooksVolumeId_key";

-- DropIndex
DROP INDEX "public"."Book_isbn13_key";

-- DropIndex
DROP INDEX "public"."Book_language_idx";

-- DropIndex
DROP INDEX "public"."Book_listPrice_idx";

-- DropIndex
DROP INDEX "public"."Book_publishedYear_idx";

-- DropIndex
DROP INDEX "public"."Book_title_idx";

-- DropIndex
DROP INDEX "public"."Order_createdAt_idx";

-- DropIndex
DROP INDEX "public"."Order_userId_status_idx";

-- DropIndex
DROP INDEX "public"."Review_bookId_rating_idx";

-- DropIndex
DROP INDEX "public"."User_role_idx";

-- AlterTable
ALTER TABLE "Book" DROP COLUMN "averageRating",
DROP COLUMN "currencyCode",
DROP COLUMN "gbooksVolumeId",
DROP COLUMN "isEbook",
DROP COLUMN "isbn10",
DROP COLUMN "isbn13",
DROP COLUMN "listPrice",
DROP COLUMN "publishedDateRaw",
DROP COLUMN "publishedYear",
DROP COLUMN "publisher",
DROP COLUMN "ratingsCount",
DROP COLUMN "smallThumbnailUrl",
DROP COLUMN "subtitle",
DROP COLUMN "thumbnailUrl",
ADD COLUMN     "authors" TEXT[],
ADD COLUMN     "avgRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "categories" TEXT[],
ADD COLUMN     "googleVolumeId" TEXT,
ADD COLUMN     "inventory" INTEGER NOT NULL,
ADD COLUMN     "numOfReviews" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "price" INTEGER NOT NULL,
ADD COLUMN     "publishedDate" TEXT,
ADD COLUMN     "thumbnail" TEXT,
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "currencyCode",
DROP COLUMN "shippingAddress",
DROP COLUMN "shippingName",
DROP COLUMN "shippingPhone",
DROP COLUMN "totalAmount",
ADD COLUMN     "clientSecret" TEXT NOT NULL,
ADD COLUMN     "paymentIntentId" TEXT,
ADD COLUMN     "shippingFee" INTEGER NOT NULL,
ADD COLUMN     "subtotal" INTEGER NOT NULL,
ADD COLUMN     "tax" INTEGER NOT NULL,
ADD COLUMN     "total" INTEGER NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_pkey",
DROP COLUMN "currencyCode",
DROP COLUMN "quantity",
DROP COLUMN "unitPrice",
ADD COLUMN     "amount" INTEGER NOT NULL,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "price" INTEGER NOT NULL,
ADD COLUMN     "thumbnail" TEXT,
ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "content",
ADD COLUMN     "comment" TEXT NOT NULL,
ALTER COLUMN "title" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "passwordHash",
ADD COLUMN     "password" TEXT NOT NULL,
ALTER COLUMN "name" SET NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

-- DropTable
DROP TABLE "public"."Author";

-- DropTable
DROP TABLE "public"."BookAuthor";

-- DropTable
DROP TABLE "public"."BookCategory";

-- DropTable
DROP TABLE "public"."Category";

-- DropEnum
DROP TYPE "public"."OrderStatus";

-- DropEnum
DROP TYPE "public"."UserRole";

-- CreateIndex
CREATE UNIQUE INDEX "Book_googleVolumeId_key" ON "Book"("googleVolumeId");

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
