const prisma = require("../utils/prisma");
const CustomError = require("../errors");
const { checkPermissions } = require("../utils");

/**
 * @desc 建立評論（需登入）
 * @route POST /reviews
 */
const createReview = async (req, res, next) => {
  try {
    const { book: bookId, rating, title, comment } = req.body;

    if (!bookId || rating == null) {
      throw new CustomError.BadRequestError("book and rating are required");
    }

    const r = Number(rating);
    if (!Number.isInteger(r) || r < 1 || r > 5) {
      throw new CustomError.BadRequestError("rating must be an integer 1..5");
    }

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      throw new CustomError.NotFoundError("Book not found");
    }

    const result = await prisma.$transaction(async (tx) => {
      // unique(userId, bookId)
      const review = await tx.review.create({
        data: {
          rating: r,
          title: title ?? "",
          comment: comment ?? "",
          userId: req.user.userId,
          bookId,
        },
      });

      const agg = await tx.review.aggregate({
        _avg: { rating: true },
        _count: { rating: true },
        where: { bookId },
      });

      await tx.book.update({
        where: { id: bookId },
        data: {
          avgRating: agg._avg.rating || 0,
          numOfReviews: agg._count.rating,
        },
      });

      return review;
    });

    res.status(201).json({ review: result });
  } catch (err) {
    if (err.code === "P2002") {
      return next(
        new CustomError.BadRequestError("You already reviewed this book")
      );
    }
    next(err);
  }
};

/**
 * @desc 取得全部評論（公開）
 * @route GET /reviews
 */
const getAllReviews = async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: { select: { name: true } },
        book: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json({ reviews, count: reviews.length });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc 取得單一評論（公開）
 * @route GET /reviews/:id
 */
const getSingleReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        user: { select: { name: true } },
        book: { select: { title: true } },
      },
    });

    if (!review) {
      throw new CustomError.NotFoundError(`Review not found: ${id}`);
    }

    res.status(200).json({ review });
  } catch (err) {
    if (err.code === "P2025") {
      return next(
        new CustomError.NotFoundError(`Review not found: ${req.params.id}`)
      );
    }
    next(err);
  }
};

/**
 * @desc 更新評論（需登入，本人或 admin）
 * @route PATCH /reviews/:id
 */
const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };

    if (data.rating != null) {
      data.rating = Number(data.rating);
      if (
        !Number.isInteger(data.rating) ||
        data.rating < 1 ||
        data.rating > 5
      ) {
        throw new CustomError.BadRequestError("rating must be an integer 1..5");
      }
    }

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      throw new CustomError.NotFoundError(`Review not found: ${id}`);
    }

    checkPermissions(req.user, review.userId);

    const updated = await prisma.$transaction(async (tx) => {
      const r = await tx.review.update({ where: { id }, data });

      const agg = await tx.review.aggregate({
        _avg: { rating: true },
        _count: { rating: true },
        where: { bookId: review.bookId },
      });

      await tx.book.update({
        where: { id: review.bookId },
        data: {
          avgRating: agg._avg.rating || 0,
          numOfReviews: agg._count.rating,
        },
      });

      return r;
    });

    res.status(200).json({ review: updated });
  } catch (err) {
    if (err.code === "P2025") {
      return next(
        new CustomError.NotFoundError(`Review not found: ${req.params.id}`)
      );
    }
    next(err);
  }
};

/**
 * @desc 刪除評論（需登入，本人或 admin）
 * @route DELETE /reviews/:id
 */
const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      throw new CustomError.NotFoundError(`Review not found: ${id}`);
    }

    checkPermissions(req.user, review.userId);

    await prisma.$transaction(async (tx) => {
      await tx.review.delete({ where: { id } });

      const agg = await tx.review.aggregate({
        _avg: { rating: true },
        _count: { rating: true },
        where: { bookId: review.bookId },
      });

      await tx.book.update({
        where: { id: review.bookId },
        data: {
          avgRating: agg._avg.rating || 0,
          numOfReviews: agg._count.rating,
        },
      });
    });

    res.status(204).send();
  } catch (err) {
    if (err.code === "P2025") {
      return next(
        new CustomError.NotFoundError(`Review not found: ${req.params.id}`)
      );
    }
    next(err);
  }
};

/**
 * @desc 取得某本書的所有評論（公開）
 * @route GET /products/:id/reviews
 */
const getSingleProductReviews = async (req, res, next) => {
  try {
    const { id: bookId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { bookId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ reviews, count: reviews.length });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getSingleProductReviews,
};
