import { Server } from "socket.io";
import { createServer } from "http";
import app from "./app.js"; // your express app

const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Customer joins their own order room
  socket.on("joinOrderRoom", (orderId) => {
    const room = `order_${orderId}`;
    socket.join(room);
    console.log(`Socket ${socket.id} joined ${room}`);
  });

  // Staff emits status updates to the customer room
  socket.on("updateOrderStatus", ({ orderId, status }) => {
    const room = `order_${orderId}`;
    io.to(room).emit("orderStatusUpdated", { orderId, status });
    console.log(`Order ${orderId} updated to ${status}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
