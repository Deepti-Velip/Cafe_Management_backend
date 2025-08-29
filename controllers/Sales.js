import Order from "../models/Order.js";

import ExcelJS from "exceljs";
import { Parser } from "json2csv";

// VIEW SALES REPORT (JSON)

// GET /api/reports/sales?start=YYYY-MM-DD&end=YYYY-MM-DD&trend=daily|monthly
export const getSalesReport = async (req, res) => {
  try {
    const { start, end, trend = "daily" } = req.query;

    let dateFilter = {};
    if (start && end) {
      dateFilter = {
        createdAt: {
          $gte: new Date(start),
          $lte: new Date(end),
        },
      };
    }

    const report = await Order.aggregate([
      { $match: { ...dateFilter, status: { $ne: "cancelled" } } },
      {
        $lookup: {
          from: "menus",
          localField: "items.menuItem",
          foreignField: "_id",
          as: "menuItems",
        },
      },
      {
        $unwind: "$items",
      },
      {
        $lookup: {
          from: "menus",
          localField: "items.menuItem",
          foreignField: "_id",
          as: "itemDetails",
        },
      },
      { $unwind: "$itemDetails" },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          totalOrders: { $sum: 1 },
          topItems: {
            $push: {
              name: "$itemDetails.name",
              qty: "$items.quantity",
              revenue: { $multiply: ["$items.quantity", "$itemDetails.price"] },
            },
          },
        },
      },
    ]);
    // === 1. Sales Trend (Line Chart) ===
    const trendFormat =
      trend === "monthly"
        ? { $dateToString: { format: "%Y-%m", date: "$createdAt" } }
        : { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };

    const salesTrend = await Order.aggregate([
      { $match: { ...dateFilter, status: { $ne: "cancelled" } } },
      {
        $group: {
          _id: trendFormat,
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // === 2. Sales by Category (Pie Chart) ===
    const categorySales = await Order.aggregate([
      { $match: { ...dateFilter, status: { $ne: "cancelled" } } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "menus",
          localField: "items.menuItem",
          foreignField: "_id",
          as: "menuItem",
        },
      },
      { $unwind: "$menuItem" },
      {
        $group: {
          _id: "$menuItem.category",
          revenue: {
            $sum: { $multiply: ["$items.quantity", "$menuItem.price"] },
          },
          qty: { $sum: "$items.quantity" },
        },
      },
    ]);

    // === 3. Top & Least Selling Products ===
    const productSales = await Order.aggregate([
      { $match: { ...dateFilter, status: { $ne: "cancelled" } } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "menus",
          localField: "items.menuItem",
          foreignField: "_id",
          as: "menuItem",
        },
      },
      { $unwind: "$menuItem" },
      {
        $group: {
          _id: "$menuItem.name",
          qty: { $sum: "$items.quantity" },
          revenue: {
            $sum: { $multiply: ["$items.quantity", "$menuItem.price"] },
          },
        },
      },
      { $sort: { qty: -1 } },
    ]);

    const topProducts = productSales.slice(0, 5);
    const leastProducts = productSales.slice(-5);

    // === 4. Sales by Time of Day (Bar Chart) ===
    const timeOfDaySalesRevenue = await Order.aggregate([
      { $match: { ...dateFilter, status: { $ne: "cancelled" } } },
      {
        $group: {
          _id: { $hour: "$createdAt" },
          revenue: { $sum: "$total" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const timeOfDaySalesOrders = await Order.aggregate([
      { $match: { ...dateFilter, status: { $ne: "cancelled" } } },
      {
        $group: {
          _id: { $hour: "$createdAt" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const revenueByDayOfWeek = await Order.aggregate([
      { $match: { ...dateFilter, status: { $ne: "cancelled" } } },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" }, // 1=Sunday, 7=Saturday
          revenue: { $sum: "$total" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const ordersByDayOfWeek = await Order.aggregate([
      { $match: { ...dateFilter, status: { $ne: "cancelled" } } },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" }, // 1=Sunday, 7=Saturday
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.status(200).json({
      totalRevenue: report[0].totalRevenue,
      totalOrders: report[0].totalOrders,
      trend: salesTrend, // line chart
      categorySales, // pie chart
      topProducts,
      leastProducts,
      timeOfDaySalesOrders, // bar chart
      timeOfDaySalesRevenue, // bar chart
      revenueByDayOfWeek,
      ordersByDayOfWeek,
    });
  } catch (error) {
    console.error("Sales Report Error:", error);
    res.status(500).json({ message: "Error generating sales report" });
  }
};

export const generateOrdersReport = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("items.menuItem", "name price")
      .populate("table_id");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Orders Report");

    // Define headers
    worksheet.columns = [
      { header: "Order ID", key: "id", width: 25 },
      { header: "Table Number", key: "table", width: 15 },
      { header: "Items", key: "items", width: 40 },
      { header: "Total", key: "total", width: 10 },
      { header: "Status", key: "status", width: 15 },
      { header: "Created At", key: "createdAt", width: 20 },
    ];

    // Fill rows
    orders.forEach((order) => {
      worksheet.addRow({
        id: order._id.toString(),
        table: order.table_id?.table_no || "N/A",
        items: order.items
          .map((i) => `${i.menuItem?.name || "Unknown"} (x${i.quantity})`)
          .join(", "),
        total: order.total,
        status: order.status,
        createdAt: order.createdAt.toLocaleString(),
      });
    });

    // Send as downloadable file
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=orders_report.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Error generating report:", err);
    res.status(500).json({ error: "Failed to generate report" });
  }
};
