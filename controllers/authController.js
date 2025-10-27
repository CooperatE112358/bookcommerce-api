const prisma = require("../utils/prisma");
const { StatusCodes } = require("http-status-codes");
const bcrypt = require("bcryptjs");
const CustomError = require("../errors");
const { attachCookiesToResponse, createTokenUser } = require("../utils");

// 註冊
const register = async (req, res) => {
  const { email, name, password } = req.body;

  const emailAlreadyExists = await prisma.user.findUnique({ where: { email } });
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError("Email already exists");
  }

  // 第一個註冊的帳號成為 admin
  const userCount = await prisma.user.count();
  const role = userCount === 0 ? "ADMIN" : "USER";

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, name, password: hashedPassword, role },
  });

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });

  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

// 登入
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new CustomError.BadRequestError("Please provide email and password");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new CustomError.UnauthenticatedError("Invalid Credential");
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Invalid Credential");
  }

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });

  res.status(StatusCodes.OK).json({ user: tokenUser });
};

// 登出
const logout = async (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: "user logged out" });
};

module.exports = {
  register,
  login,
  logout,
};
