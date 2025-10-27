const jwt = require("jsonwebtoken");

const createJWT = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
  return token;
};

const isTokenValid = ({ token }) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const attachCookiesToResponse = ({ res, user }) => {
  const token = createJWT({ payload: user });
  const oneDay = 1000 * 60 * 60 * 24;
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
    // sameSite: "strict", // security
    expires: new Date(Date.now() + oneDay),
  });
};

module.exports = {
  createJWT,
  isTokenValid,
  attachCookiesToResponse,
};
