const { checkDatabaseHealth } = require("../services/healthService");

/**
 * GET /api/v1/health
 * 用於檢查應用與資料庫狀態（ALB / PM2 監控）
 */
const getHealthStatus = async (req, res) => {
  const dbStatus = await checkDatabaseHealth();
  const uptimeSec = Math.floor(process.uptime());

  const payload = {
    ...dbStatus,
    uptime: `${uptimeSec}s`,
    timestamp: new Date().toISOString(),
  };

  if (dbStatus.db === "connected") {
    return res.status(200).json({ status: "ok", ...payload });
  }

  return res.status(500).json({ status: "error", ...payload });
};

module.exports = { getHealthStatus };
