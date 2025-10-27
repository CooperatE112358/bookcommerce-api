const express = require("express");
const { searchBooks } = require("../controllers/booksController");

const router = express.Router();

router.get("/search", searchBooks);

module.exports = router;
