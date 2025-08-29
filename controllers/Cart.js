import Cart from "../models/Cart.js";
import Menu from "../models/Menu.js";

// Create new cart

export const createCart = async (req, res) => {
  try {
    const itemsWithPrices = await Promise.all(
      req.body.items.map(async (item) => {
        const menu = await Menu.findById(item.menuItem);
        if (!menu) throw new Error(`Menu item not found: ${item.menuItem}`);
        return {
          menuItem: menu._id,
          quantity: item.quantity,
          price: menu.price,
        };
      })
    );

    // 3. Create the cart
    const cart = new Cart({
      items: itemsWithPrices,
    });
    await cart.save();

    res.status(201).json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all carts
export const getCarts = async (req, res) => {
  try {
    const carts = await Cart.find().populate("items.menuItem");
    res.json(carts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update cart (add/remove items)
export const updateCart = async (req, res) => {
  try {
    const cart = await Cart.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete cart
export const deleteCart = async (req, res) => {
  try {
    await Cart.findByIdAndDelete(req.params.id);
    res.json({ message: "Cart deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCartById = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id).populate("items.menuItem");
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /carts/:cartId/items/:itemId   (update quantity)
export const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be >= 1" });
    }

    const cart = await Cart.findById(req.params.cartId);
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.id(req.params.itemId);
    if (!item)
      return res.status(404).json({ message: "Item not found in cart" });

    item.quantity = quantity;
    await cart.save();

    await cart.populate("items.menuItem");
    res.json(cart);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating cart item", error: err.message });
  }
};

// DELETE /carts/:cartId/items/:itemId
export const removeCartItem = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cartId);
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.id(req.params.itemId);
    if (!item)
      return res.status(404).json({ message: "Item not found in cart" });

    cart.items.pull({ _id: req.params.itemId });
    await cart.save();

    await cart.populate("items.menuItem");
    res.json(cart);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error removing cart item", error: err.message });
  }
};
