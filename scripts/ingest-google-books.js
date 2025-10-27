const prisma = require("../utils/prisma");
const {
  fetchGoogleBooks,
  transformVolumeToBook,
} = require("../utils/googleBooks");
const { withRetry, throttle, logError } = require("../utils/retryThrottle");
const dotenv = require("dotenv");
dotenv.config();

async function ingestBooks() {
  const queries = [
    "Leadership",
    "Productivity",
    "Marketing",
    "Startup",
    "Time Management",
  ];

  for (const query of queries) {
    console.log(`\nFetching books for: ${query}`);
    for (let start = 0; start < 100; start += 20) {
      await throttle(async () => {
        try {
          const volumes = await withRetry(() => fetchGoogleBooks(query, start));
          for (const volume of volumes) {
            const book = transformVolumeToBook(volume);

            // 跳過缺少 ID 的資料（Google API 有時會出現不完整項）
            if (!book.googleVolumeId) {
              console.warn(`Skipped: missing googleVolumeId (${book.title})`);
              continue;
            }

            try {
              await prisma.book.upsert({
                where: { googleVolumeId: book.googleVolumeId },
                update: { ...book },
                create: { ...book },
              });
              console.log(`Upserted: ${book.title}`);
            } catch (err) {
              const msg = `Prisma Error (${book.googleVolumeId}): ${err.message}`;
              console.error(msg);
              logError(msg);
            }
          }
        } catch (err) {
          const msg = `Fetch Error for query "${query}" (start=${start}): ${err.message}`;
          console.error(msg);
          logError(msg);
        }
      }, 1000); // 每秒一次請求，避免 hitting rate limit
    }
  }

  console.log("\nIngestion completed");
  await prisma.$disconnect();
}

// 安全執行封裝
ingestBooks()
  .catch((err) => {
    console.error("Fatal error:", err.message);
    logError(`Fatal: ${err.message}`);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
