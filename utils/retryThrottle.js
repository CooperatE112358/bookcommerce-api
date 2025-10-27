const fs = require("fs");

/**
 * 重試機制：遇到錯誤時重新執行
 */
const withRetry = async (fn, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      console.warn(`Retry ${i + 1}/${retries} after error: ${err.message}`);
      if (i < retries - 1) {
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw new Error("Failed after all retries");
};

/**
 * 節流：等待一定時間後執行
 */
const throttle = async (fn, delay = 500) => {
  await new Promise((r) => setTimeout(r, delay));
  return fn();
};

/**
 * 錯誤記錄工具：寫入 logs/ingest-error.log
 */
const logError = (message) => {
  const logDir = "./logs";
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }
  const timestamp = new Date().toISOString();
  fs.appendFileSync(
    `${logDir}/ingest-error.log`,
    `[${timestamp}] ${message}\n`
  );
};

module.exports = {
  withRetry,
  throttle,
  logError,
};
