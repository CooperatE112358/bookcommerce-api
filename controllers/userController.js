const prisma = require("../utils/prisma");
const { StatusCodes } = require("http-status-codes");
const bcrypt = require("bcryptjs");
const CustomError = require("../errors");
const {
  createTokenUser,
  attachCookiesToResponse,
  checkPermissions,
} = require("../utils");

const getAllUsers = async (req, res) => {
  const users = await prisma.user.findMany({
    where: { role: "USER" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
  res.status(StatusCodes.OK).json({ users });
};

const getSingleUsers = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new CustomError.NotFoundError(`No user with id : ${req.params.id}`);
  }

  checkPermissions(req.user, user.id);
  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

const updateUser = async (req, res) => {
  const { email, name } = req.body;
  if (!email || !name) {
    throw new CustomError.BadRequestError("Please provide all values");
  }

  // 檢查是否其他使用者已使用此 email
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser && existingUser.id !== req.user.userId) {
    throw new CustomError.BadRequestError("Email already in use");
  }

  // 更新自己的資料
  const updatedUser = await prisma.user.update({
    where: { id: req.user.userId },
    data: { email, name },
  });

  // 更新 cookie token
  const tokenUser = createTokenUser(updatedUser);
  attachCookiesToResponse({ res, user: tokenUser });

  res.status(StatusCodes.OK).json({ user: tokenUser });
};

// 更新密碼
const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError("Please provide both values");
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });

  const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: req.user.userId },
    data: { password: hashedPassword },
  });

  res.status(StatusCodes.OK).json({ msg: "Success! Password updated." });
};

module.exports = {
  getAllUsers,
  getSingleUsers,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
