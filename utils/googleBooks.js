const axios = require("axios");

const GOOGLE_BOOKS_API = "https://www.googleapis.com/books/v1/volumes";

/**
 * 取得 Google Books API 資料
 * @param {string} query - 搜尋關鍵字
 * @param {number} startIndex - 起始索引
 * @param {number} maxResults - 最大筆數（Google Books 限制為 40）
 */
const fetchGoogleBooks = async (query, startIndex = 0, maxResults = 20) => {
  const keyParam = process.env.GOOGLE_API_KEY
    ? `&key=${process.env.GOOGLE_API_KEY}`
    : "";

  const url = `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(
    query
  )}&startIndex=${startIndex}&maxResults=${maxResults}${keyParam}`;

  const { data } = await axios.get(url);
  return data.items || [];
};

/**
 * 將 Google Books Volume 轉換為 Prisma Book schema 格式
 * schema 對應：
 * id, googleVolumeId, title, authors[], thumbnail, description,
 * categories[], pageCount, publishedDate, language, price, inventory,
 * avgRating, numOfReviews, createdAt, updatedAt
 */
const transformVolumeToBook = (volume) => {
  const info = volume.volumeInfo || {};

  // 清理輸入資料
  const cleanText = (text) => {
    if (!text) return null;
    return text.replace(/\s+/g, " ").trim();
  };

  return {
    googleVolumeId: volume.id, //
    title: cleanText(info.title) || "Untitled",
    authors: info.authors || [],
    thumbnail: info.imageLinks?.thumbnail || null,
    description: cleanText(info.description),
    categories: info.categories || [],
    pageCount: info.pageCount || null,
    publishedDate: info.publishedDate || null,
    language: info.language || null,

    // Prisma 必填欄位（本地生成假值）
    price: Math.floor(Math.random() * 2000) + 500, // 單位：cents
    inventory: Math.floor(Math.random() * 50) + 10,

    avgRating: 0,
    numOfReviews: 0,
  };
};

module.exports = {
  fetchGoogleBooks,
  transformVolumeToBook,
};
