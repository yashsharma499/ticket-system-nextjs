import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

/* ================= ACCESS TOKEN ================= */
export function generateAccessToken(payload) {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: "15m",
  });
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, ACCESS_SECRET);
  } catch {
    return null; // expired or invalid
  }
}

/* ================= REFRESH TOKEN ================= */
export function generateRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, REFRESH_SECRET);
  } catch {
    return null;
  }
}
