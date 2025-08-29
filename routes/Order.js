import express from "express";
import {
  createOrderFromCart,
  getOrders,
  updateOrderStatus,
  deleteOrder,
  getOrderById,
} from "../controllers/Order.js";
import { authMiddleware, requireRole } from "../middleware/Auth.js";

const router = express.Router();

router.post("/cart/:cartId", createOrderFromCart);
router.get("/", getOrders);
router.get("/:id", getOrderById);
router.put(
  "/:id/status",
  authMiddleware,
  requireRole("staff"),
  updateOrderStatus
);
router.delete("/:id", authMiddleware, requireRole("staff"), deleteOrder);

export default router;
