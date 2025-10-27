const prisma = require("../utils/prisma");

const checkDatabaseHealth = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { db: "connected" };
  } catch (error) {
    return { db: "disconnected", error: error.message };
  }
};

module.exports = { checkDatabaseHealth };
