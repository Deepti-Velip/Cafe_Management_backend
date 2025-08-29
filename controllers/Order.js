import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Table from "../models/Table.js";

// Create order from cart
export const createOrderFromCart = async (req, res) => {
  try {
    const { cartId } = req.params;
    const { table_no } = req.body; // ✅ extract table_no from request body

    const cart = await Cart.findById(cartId).populate("items.menuItem");
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    // Calculate total using menuItem.price
    const total = cart.items.reduce(
      (sum, item) => sum + (item.menuItem.price || 0) * item.quantity,
      0
    );

    // Ensure table exists
    const table = await Table.findOne({ table_no });
    if (!table) return res.status(404).json({ error: "Table not found" });

    const order = new Order({
      items: cart.items,
      total,
      table_id: table._id,
      status: "pending",
    });

    // Update table status → occupied
    table.status = "occupied";
    await table.save();

    await order.save();
    await Cart.findByIdAndDelete(cartId);

    res.json({ message: "Order created successfully", orderId: order._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.menuItem")
      .populate("table_id");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const getOrders = async (req, res) => {
  try {
    const { status, sortBy = "createdAt", search } = req.query;

    const filter = {};
    if (status) filter.order_status = status; // ✅ match schema

    let query = Order.find(filter)
      .populate("items.menuItem")
      .populate("table_id");

    if (search) {
      const searchFilter = [
        { "items.menuItem.name": { $regex: search, $options: "i" } },
      ];
      if (/^[0-9a-fA-F]{24}$/.test(search)) {
        searchFilter.push({ _id: search });
      }
      query = query.find({ $or: searchFilter });
    }

    const orders = await query.sort({ [sortBy]: -1 }); // ✅ fixed sort
    res.json(orders);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching orders", error: err.message });
  }
};

//  Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = req.body.status || order.status;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete order
export const deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
