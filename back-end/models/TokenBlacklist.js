//  /models/TokenBlacklist.js
import mongoose from "mongoose";
const TokenBlacklistSchema = new mongoose.Schema({
  token: { type: String, required: !0, unique: !0 },
  expiresAt: { type: Date, required: !0 },
});
TokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
const TokenBlacklist = mongoose.model("TokenBlacklist", TokenBlacklistSchema);
export default TokenBlacklist;
