import jwt from "jsonwebtoken";
import connectDB from "../db/db.js";

export const verifyToken = async (req, res, next) => {
  try {
    await connectDB();

    // First try the httpOnly cookie (works when sameSite:none is set)
    let token = req.cookies.token;

    // Fallback: Authorization: Bearer <token> header (used by frontend localStorage strategy)
    if (!token) {
      const authHeader = req.headers["authorization"];
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - no token provided" });
    }

    const decoded = jwt.verify(token, process.env.SECRET);

    if (!decoded) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - invalid token" });
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error("Error in verifyToken middleware:", error);
    return res
      .status(401)
      .json({
        success: false,
        message: "Unauthorized - invalid or expired token",
      });
  }
};
