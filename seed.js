// seed.js
import mongoose from "mongoose";
import dotenv from "dotenv";

import Menu from "./models/Menu.js";
import Cart from "./models/Cart.js";
import Order from "./models/Order.js";
import Table from "./models/Table.js";
import User from "./models/User.js";

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/restaurant";

const categories = ["Food", "Beverage", "Dessert"];
const statuses = ["pending", "in_progress", "completed", "cancelled"];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(" Connected to MongoDB");

    // Clean existing data
    await Promise.all([
      Menu.deleteMany(),
      Cart.deleteMany(),
      Order.deleteMany(),
      Table.deleteMany(),
      User.deleteMany(),
    ]);

    console.log(" Cleared old data");

    // 1. Seed Menu Items
    const menuItems = [];
    for (let i = 1; i <= 20; i++) {
      menuItems.push({
        name: `Menu Item ${i}`,
        description: `Delicious dish number ${i}`,
        price: Math.floor(Math.random() * 50) + 10, // $10 - $60
        category: categories[Math.floor(Math.random() * categories.length)],
      });
    }
    const menus = await Menu.insertMany(menuItems);
    console.log(`Seeded ${menus.length} menu items`);

    // 2. Seed Tables
    const tables = [];
    for (let i = 1; i <= 10; i++) {
      tables.push({
        table_no: i,
        capacity: Math.floor(Math.random() * 6) + 2, // 2 - 7 seats
        status: "available",
      });
    }
    const seededTables = await Table.insertMany(tables);
    console.log(` Seeded ${seededTables.length} tables`);

    // 3. Seed Users (Admin + Staff)
    const users = await User.insertMany([
      {
        name: "Admin User",
        email: "admin@example.com",
        passwordHash: "hashedpassword",
        role: "admin",
      },
      {
        name: "Staff User",
        email: "staff@example.com",
        passwordHash: "hashedpassword",
        role: "staff",
      },
    ]);
    console.log(`Seeded ${users.length} users`);

    // 4. Seed Carts
    const carts = [];
    for (let i = 0; i < 30; i++) {
      const cartItems = [];
      const numItems = Math.floor(Math.random() * 4) + 1; // 1 - 4 items per cart

      for (let j = 0; j < numItems; j++) {
        const menu = menus[Math.floor(Math.random() * menus.length)];
        const quantity = Math.floor(Math.random() * 3) + 1; // 1 - 3 qty
        cartItems.push({
          menuItem: menu._id,
          quantity,
          price: menu.price,
        });
      }
      carts.push({ items: cartItems });
    }
    const seededCarts = await Cart.insertMany(carts);
    console.log(`Seeded ${seededCarts.length} carts`);

    // 5. Seed Orders (based on carts)
    const orders = [];
    for (let i = 0; i < 30; i++) {
      const cart = seededCarts[Math.floor(Math.random() * seededCarts.length)];
      const table =
        seededTables[Math.floor(Math.random() * seededTables.length)];

      const total = cart.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      orders.push({
        items: cart.items.map((ci) => ({
          menuItem: ci.menuItem,
          quantity: ci.quantity,
        })),
        table_id: table._id,
        total,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        createdAt: new Date(
          Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
        ), // within last 30 days
      });
    }

    const seededOrders = await Order.insertMany(orders);
    console.log(`Seeded ${seededOrders.length} orders`);

    console.log(" Seeding complete!");
    process.exit();
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
