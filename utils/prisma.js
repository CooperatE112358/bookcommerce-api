const { PrismaClient } = require("@prisma/client");

const getPrisma = () => {
  if (process.env.NODE_ENV === "production") {
    return new PrismaClient();
  }

  // 開發模式下使用 global.prisma 以避免熱重載重複實例化
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }

  return global.prisma;
};

const prisma = getPrisma();

module.exports = prisma;
