const prisma = require("../utils/prisma");
const CustomError = require("../errors");
const { checkPermissions } = require("../utils");

function fakePaymentAPI({ amount, currency = "usd" }) {
  return { client_secret: `fake_cs_${Date.now()}`, amount, currency };
}

/**
 * @desc 取得所有訂單（僅管理員可見）
 * @route GET /api/v1/orders
 */
const getAllOrders = async (req, res, next) => {
  try {
    // 僅 admin 可檢視所有訂單
    if (req.user.role !== "ADMIN") {
      throw new CustomError.UnauthorizedError(
        "Not authorized to access all orders"
      );
    }

    const orders = await prisma.order.findMany({
      include: {
        orderItems: true,
        user: { select: { id: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ count: orders.length, orders });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc 取得單一訂單
 * @route GET /api/v1/orders/:id
 */
const getSingleOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { orderItems: true, user: true },
    });

    if (!order) {
      throw new CustomError.NotFoundError(`No order with id: ${id}`);
    }

    // 僅本人或 admin 可查閱
    checkPermissions(req.user, order.userId);

    res.status(200).json({ order });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc 取得目前使用者的所有訂單
 * @route GET /api/v1/orders/showAllMyOrders
 */
const getCurrentUserOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.userId },
      include: { orderItems: true },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ count: orders.length, orders });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc 建立新訂單（不扣庫存）
 * @route POST /api/v1/orders
 */
const createOrder = async (req, res, next) => {
  try {
    const { cartItems, tax, shippingFee } = req.body;

    if (!Array.isArray(cartItems) || cartItems.length < 1) {
      throw new CustomError.BadRequestError("No cart items");
    }
    if (tax == null || shippingFee == null) {
      throw new CustomError.BadRequestError(
        "Please provide tax and shipping fee"
      );
    }

    let subtotal = 0;
    const orderItemsData = [];

    // 檢查書籍與小計
    for (const item of cartItems) {
      if (!item?.book || !item?.amount) {
        throw new CustomError.BadRequestError(
          "Each cart item requires book and amount"
        );
      }

      const book = await prisma.book.findUnique({ where: { id: item.book } });
      if (!book) {
        throw new CustomError.NotFoundError(`No book with id: ${item.book}`);
      }
      if (book.inventory < item.amount) {
        throw new CustomError.BadRequestError(
          `Insufficient stock for ${book.title}`
        );
      }

      subtotal += book.price * item.amount;
      orderItemsData.push({
        name: book.title,
        price: book.price,
        amount: item.amount,
        thumbnail: book.thumbnail,
        bookId: book.id,
      });
    }

    const total = subtotal + Number(tax) + Number(shippingFee);
    const paymentIntent = fakePaymentAPI({ amount: total });

    // 建立訂單（不扣庫存）
    const order = await prisma.$transaction(async (tx) => {
      return tx.order.create({
        data: {
          tax: Number(tax),
          shippingFee: Number(shippingFee),
          subtotal,
          total,
          clientSecret: paymentIntent.client_secret,
          // ✅ 使用關聯 connect 更穩定
          user: {
            connect: { id: req.user.userId },
          },
          orderItems: { create: orderItemsData },
        },
        include: { orderItems: true },
      });
    });

    res.status(201).json({ order, clientSecret: paymentIntent.client_secret });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc 更新訂單狀態（付款成功後才扣庫存）
 * @route PATCH /api/v1/orders/:id
 */
const updateOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paymentIntentId } = req.body;
    if (!paymentIntentId) {
      throw new CustomError.BadRequestError("paymentIntentId is required");
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { orderItems: true },
    });
    if (!order) {
      throw new CustomError.NotFoundError(`No order with id: ${id}`);
    }

    checkPermissions(req.user, order.userId);

    if (order.status === "paid") {
      return res.status(200).json({ order });
    }

    const updated = await prisma.$transaction(async (tx) => {
      // 扣庫存
      await Promise.all(
        order.orderItems.map((oi) =>
          tx.book.update({
            where: { id: oi.bookId },
            data: { inventory: { decrement: oi.amount } },
          })
        )
      );

      // 更新訂單狀態
      return tx.order.update({
        where: { id },
        data: { paymentIntentId, status: "paid" },
        include: { orderItems: true },
      });
    });

    res.status(200).json({ order: updated });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
};
