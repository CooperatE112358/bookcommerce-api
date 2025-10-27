const axios = require("axios");

const fetchBooksFromGoogle = async (
  q = "javascript",
  { startIndex = 0, maxResults = 10 } = {}
) => {
  const params = {
    q,
    startIndex,
    maxResults,
    key: process.env.GOOGLE_API_KEY, // 你 .env 已有
  };

  const { data } = await axios.get(
    "https://www.googleapis.com/books/v1/volumes",
    { params }
  );

  const items = (data.items || []).map((v) => {
    const info = v.volumeInfo || {};
    const sale = v.saleInfo || {};

    return {
      googleVolumeId: v.id,
      title: info.title,
      authors: info.authors || [],
      thumbnail: info.imageLinks?.thumbnail || null,
      description: info.description || "",
      categories: info.categories || [],
      pageCount: info.pageCount || null,
      publishedDate: info.publishedDate || null,
      language: info.language || null,
      // 若有定價可參考；真正售價由 admin 上架時決定
      suggestedRetailCents: sale.listPrice?.amount
        ? Math.round(sale.listPrice.amount * 100)
        : null,
    };
  });

  return { total: data.totalItems || 0, items };
};

module.exports = { fetchBooksFromGoogle };
