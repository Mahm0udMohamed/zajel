// routes/userRoutes.js
import express from "express";
import rateLimit from "express-rate-limit";
import {
  getUser,
  updateUser,
  updatePassword,
  uploadProfilePicture,
  requestEmailUpdate,
  verifyEmailUpdate,
  deleteUser,
  signProfilePictureUpload,
} from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

const passwordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: "Too many password update attempts. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get("/me", authMiddleware, getUser);
router.put("/update", authMiddleware, updateUser);
router.put("/update-password", authMiddleware, passwordLimiter, updatePassword);
router.post(
  "/sign-profile-picture-upload",
  authMiddleware,
  signProfilePictureUpload
);
router.post("/upload-profile-picture", authMiddleware, uploadProfilePicture);
router.post("/request-email-update", authMiddleware, requestEmailUpdate);
router.post("/verify-email-update", authMiddleware, verifyEmailUpdate);
router.delete("/delete-account", authMiddleware, deleteUser);

export default router;
