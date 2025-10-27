const prisma = require("../utils/prisma");
const CustomError = require("../errors");
const path = require("path");
const fs = require("fs");

/**
 * @desc 管理員建立商品（從 Google Books 匯入）
 * @route POST /products
 * @access Admin
 */
const createProduct = async (req, res) => {
  const { googleVolumeId, price, inventory } = req.body;

  if (!googleVolumeId || price == null || inventory == null) {
    return res
      .status(400)
      .json({ msg: "googleVolumeId, price, inventory are required" });
  }

  // 檢查是否重複匯入
  const exists = await prisma.book.findUnique({ where: { googleVolumeId } });
  if (exists) {
    return res.status(400).json({ msg: "Book already imported" });
  }

  // 建立新書籍（可選：可搭配 Google Books API）
  const book = await prisma.book.create({
    data: {
      googleVolumeId,
      title: req.body.title,
      authors: req.body.authors || [],
      thumbnail: req.body.thumbnail || null,
      description: req.body.description || "",
      categories: req.body.categories || [],
      pageCount: req.body.pageCount || null,
      publishedDate: req.body.publishedDate || null,
      language: req.body.language || null,
      price: Number(price),
      inventory: Number(inventory),
      userId: req.user.userId, // 管理員 ID
    },
  });

  res.status(201).json({ product: book });
};

/**
 * @desc 取得所有商品
 * @route GET /products
 */
const getAllProduct = async (req, res) => {
  const books = await prisma.book.findMany({ orderBy: { createdAt: "desc" } });
  res.status(200).json({ products: books, count: books.length });
};

/**
 * @desc 取得單一本書
 * @route GET /products/:id
 */
const getSingleProduct = async (req, res) => {
  const { id } = req.params;

  const book = await prisma.book.findUnique({
    where: { id },
    include: { reviews: true },
  });

  if (!book) {
    return res.status(404).json({ msg: "Book not found" });
  }

  res.status(200).json({ product: book });
};

/**
 * @desc 更新商品資料
 * @route PATCH /products/:id
 */
const updateProduct = async (req, res) => {
  const { id } = req.params;

  const book = await prisma.book.update({
    where: { id },
    data: req.body,
  });

  res.status(200).json({ product: book });
};

/**
 * @desc 刪除商品
 * @route DELETE /products/:id
 */
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  await prisma.book.delete({ where: { id } });
  res.status(200).json({ msg: "Success! Book removed." });
};

/**
 * @desc 上傳書籍圖片
 * @route POST /products/uploadImage
 */
const uploadImage = async (req, res, next) => {
  try {
    if (!req.files || !req.files.image) {
      throw new CustomError.BadRequestError("No image file uploaded");
    }

    const imageFile = req.files.image;

    // 驗證檔案格式
    if (!imageFile.mimetype.startsWith("image")) {
      throw new CustomError.BadRequestError("Please upload an image file");
    }

    // 限制檔案大小（1MB）
    const maxSize = 1024 * 1024;
    if (imageFile.size > maxSize) {
      throw new CustomError.BadRequestError("Image must be smaller than 1MB");
    }

    // 建立上傳目錄
    const uploadDir = path.join(__dirname, "../public/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 生成檔案名稱
    const fileName = `book_${Date.now()}_${imageFile.name}`;
    const filePath = path.join(uploadDir, fileName);

    // 寫入檔案
    await imageFile.mv(filePath);

    // 回傳可用的圖片網址
    const imageUrl = `/uploads/${fileName}`;
    res.status(200).json({ image: imageUrl });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createProduct,
  getAllProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};
