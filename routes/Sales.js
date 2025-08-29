import express from "express";
import { getSalesReport, generateOrdersReport } from "../controllers/Sales.js";
import { authMiddleware, requireRole } from "../middleware/Auth.js";

const router = express.Router();

router.get("/", authMiddleware, requireRole("admin", "staff"), getSalesReport);
router.get("/excel", generateOrdersReport);
export default router;
