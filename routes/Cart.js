import express from "express";
import {
  createCart,
  getCarts,
  updateCart,
  deleteCart,
  getCartById,
  updateCartItem,
  removeCartItem,
} from "../controllers/Cart.js";

const router = express.Router();

router.post("/", createCart);
router.get("/:id", getCartById);
router.get("/", getCarts);
router.put("/:id", updateCart);
router.delete("/:id", deleteCart);
router.put("/:cartId/items/:itemId", updateCartItem);
router.delete("/:cartId/items/:itemId", removeCartItem);
export default router;
