import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/Auth.js";
import menuRoutes from "./routes/Menu.js";
import cartRoutes from "./routes/Cart.js";
import orderRoutes from "./routes/Order.js";
import salesRoutes from "./routes/Sales.js";
import tableRoutes from "./routes/Table.js";

dotenv.config();

connectDB();
const app = express();
app.use(
  cors({
    origin: [
      "https://cafe-management-frontend-nine.vercel.app",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/tables", tableRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});
export default app;
