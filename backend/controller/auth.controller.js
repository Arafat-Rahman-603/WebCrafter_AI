import User from "../model/user.model.js";
import { OAuth2Client } from "google-auth-library";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const findOrCreateGoogleUser = async (payload) => {
  try {
    const email = payload.email.toLowerCase();
    let user = await User.findOne({
      $or: [{ googleId: payload.sub }, { email }],
    });

    if (!user) {
      user = await User.create({
        name: payload.name || email.split("@")[0],
        email,
        googleId: payload.sub,
        authProvider: "google",
        isVerified: true,
        profilePicture: payload.picture || "",
      });
    } else {
      // Update user info if it changed
      user.googleId = payload.sub;
      user.authProvider = "google";
      user.isVerified = true;

      if (payload.name && user.name !== payload.name) {
        user.name = payload.name;
      }

      if (payload.picture) {
        user.profilePicture = payload.picture;
      }

      await user.save();
    }

    return user;
  } catch (error) {
    console.error("[Auth] Database error in findOrCreateGoogleUser:", error);
    throw new Error("Database error during user authentication");
  }
};

export const googleAuth = async (req, res) => {
  const { credential } = req.body;

  if (!process.env.GOOGLE_CLIENT_ID) {
    console.error("[Auth] Missing GOOGLE_CLIENT_ID in environment variables");
    return res.status(500).json({
      success: false,
      message: "Server configuration error: GOOGLE_CLIENT_ID is missing",
    });
  }

  if (!credential) {
    return res
      .status(400)
      .json({ success: false, message: "Credential is required" });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email || !payload.sub) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Google token payload" });
    }

    const user = await findOrCreateGoogleUser(payload);

    const token = generateTokenAndSetCookie(res, user._id);

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        credits: user.credits,
        plan: user.plan,
        bio: user.bio,
      },
      token,
    });
  } catch (error) {
    console.error("Google auth error detail:", error);
    return res.status(500).json({
      success: false,
      message: "Google authentication failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Logout
export const logout = (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 0,
    });
    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error during logout" });
  }
};

// Check Auth - for frontend validation on page reload
export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Check auth error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error during auth check" });
  }
};
