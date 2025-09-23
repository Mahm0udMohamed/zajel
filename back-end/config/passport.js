// config/passport.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import dotenv from "dotenv";
import { hashPassword } from "./auth.js";
import crypto from "crypto";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google OAuth profile received:", profile.id);

        // التحقق من وجود البيانات المطلوبة
        if (!profile.emails || !profile.emails[0] || !profile.emails[0].value) {
          console.error("No email found in Google profile");
          return done(new Error("No email found in Google profile"), null);
        }

        const email = profile.emails[0].value;
        console.log("Looking for user with email:", email);

        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          console.log("Creating new user from Google profile");
          user = new User({
            name:
              profile.displayName ||
              `${profile.name.givenName || "User"} ${
                profile.name.familyName || "Google"
              }`,
            email: profile.emails[0].value,
            password: crypto.randomBytes(16).toString("hex"), // سيتم تشفيرها تلقائياً في pre-save hook
            isVerified: true,
            googleId: profile.id,
          });
          await user.save();
          console.log("New user created:", user._id);
        } else {
          console.log("Existing user found:", user._id);
          // تحديث Google ID إذا لم يكن موجوداً
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
            console.log("Google ID updated for existing user");
          }
        }

        return done(null, user);
      } catch (err) {
        console.error("Google OAuth strategy error:", err);
        return done(err, null);
      }
    }
  )
);

// تحويل كائن المستخدم إلى معرف فقط في الجلسة
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// استرجاع المستخدم من المعرف
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
