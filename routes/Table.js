// routes/tableRoutes.js
import express from "express";
import {
  createTable,
  getTables,
  getTableById,
  updateTable,
  deleteTable,
  getTablesByNo,
} from "../controllers/Table.js";

const router = express.Router();

router.post("/", createTable);
router.get("/", getTables);
router.get("/:id", getTableById);
router.put("/:id", updateTable);
router.delete("/:id", deleteTable);
router.get("/", getTablesByNo);

export default router;
