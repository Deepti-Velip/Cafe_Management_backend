import express from "express";
import {
  getMenu,
  getMenuItem,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getMenuImage,
} from "../controllers/Menu.js";
import { authMiddleware } from "../middleware/Auth.js";
import multer from "multer";

const router = express.Router();

// ✅ configure multer to use memory storage (buffer)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes
router.get("/", getMenu);
router.get("/:id", getMenuItem);
router.post("/", authMiddleware, upload.single("image"), addMenuItem);
router.put("/:id", authMiddleware, updateMenuItem);
router.delete("/:id", authMiddleware, deleteMenuItem);
router.get("/:id/image", getMenuImage);

export default router;
