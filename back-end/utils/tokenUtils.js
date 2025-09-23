//  utils/tokenUtils.js
import TokenBlacklist from "../models/TokenBlacklist.js";
export const addToBlacklist = async (token, expiresAt) => {
  const blacklistedToken = new TokenBlacklist({ token, expiresAt });
  await blacklistedToken.save();
};
