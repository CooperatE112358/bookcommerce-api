const { fetchBooksFromGoogle } = require("../services/googleBooksService");
const CustomError = require("../errors");

const searchBooks = async (req, res, next) => {
  try {
    const q =
      typeof req.query.q === "string" && req.query.q.trim().length
        ? req.query.q.trim()
        : "javascript";

    const books = await fetchBooksFromGoogle(q);
    return res.status(200).json(books);
  } catch (err) {
    // 將第三方 API 的錯誤轉為語意化錯誤，交給全域錯誤處理器
    if (err.response) {
      const status = err.response.status;
      const msg =
        err.response.data?.error?.message ||
        err.response.data?.message ||
        "Google Books API error";
      return next(
        new CustomError.BadRequestError(`Google Books API ${status}: ${msg}`)
      );
    }
    return next(err);
  }
};

module.exports = { searchBooks };
