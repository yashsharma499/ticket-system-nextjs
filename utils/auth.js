// import jwt from "jsonwebtoken";

// const ACCESS_SECRET = process.env.JWT_SECRET;
// const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// /* ================= ACCESS TOKEN ================= */
// // Short-lived token (used everywhere)
// export function generateAccessToken(payload) {
//   return jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });
// }

// // ⚠️ Backward compatibility
// // Old code calls generateToken()
// export function generateToken(payload) {
//   return generateAccessToken(payload);
// }

// export function verifyToken(token) {
//   try {
//     return jwt.verify(token, ACCESS_SECRET);
//   } catch {
//     return null;
//   }
// }

// /* ================= REFRESH TOKEN ================= */
// // Long-lived token
// export function generateRefreshToken(payload) {
//   return jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });
// }

// export function verifyRefreshToken(token) {
//   try {
//     return jwt.verify(token, REFRESH_SECRET);
//   } catch {
//     return null;
//   }
// }
import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

/* ================= ACCESS TOKEN ================= */
// Short-lived token (used everywhere)
export function generateAccessToken(payload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });
}

// ⚠️ Backward compatibility
// Old code calls generateToken()
export function generateToken(payload) {
  return generateAccessToken(payload);
}

/* ================= VERIFY ACCESS TOKEN ================= */
export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, ACCESS_SECRET);

    // 🔒 NORMALIZE USER ID (fixes agent issue)
    return {
      id: decoded.id || decoded._id,
      role: decoded.role,
      email: decoded.email,
    };
  } catch {
    return null;
  }
}

/* ================= REFRESH TOKEN ================= */
// Long-lived token
export function generateRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });
}

/* ================= VERIFY REFRESH TOKEN ================= */
export function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, REFRESH_SECRET);

    // 🔒 SAME NORMALIZATION
    return {
      id: decoded.id || decoded._id,
      role: decoded.role,
      email: decoded.email,
    };
  } catch {
    return null;
  }
}
