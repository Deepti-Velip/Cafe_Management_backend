import express from "express";
import {
  registerUser,
  loginUser,
  getAllUsers,
  updateUserAccess,
  deleteUser,
  updateUserRole,
} from "../controllers/Auth.js";
import { authMiddleware, requireRole } from "../middleware/Auth.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.get("/", authMiddleware, requireRole("admin"), getAllUsers);
router.patch(
  "/:id/access",
  authMiddleware,
  requireRole("admin"),
  updateUserAccess
);
router.patch("/:id/role", authMiddleware, requireRole("admin"), updateUserRole);
router.delete("/:id", authMiddleware, requireRole("admin"), deleteUser);
export default router;
