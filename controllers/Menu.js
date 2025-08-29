import Menu from "../models/Menu.js";

// Get all menu items

export const getMenu = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

    if (search) query.name = { $regex: search, $options: "i" };
    if (category) query.category = category;

    const menu = await Menu.find(query);
    res.json(menu);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching menu", error: err.message });
  }
};

// Get single menu item
export const getMenuItem = async (req, res) => {
  try {
    const menuItem = await Menu.findById(req.params.id);
    if (!menuItem) return res.status(404).json({ message: "Item not found" });
    res.json(menuItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add new menu item
export const addMenuItem = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Image is required" });
    }
    const { name, description, price, category } = req.body;
    const menuItem = new Menu({
      name,
      description,
      price,
      category,
      image: req.file
        ? {
            data: req.file.buffer, // ✅ actual image binary
            contentType: req.file.mimetype,
          }
        : undefined,
    });

    await menuItem.save();
    res.status(201).json({
      message: "Menu item created successfully",
      menuItem,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update menu item
export const updateMenuItem = async (req, res) => {
  try {
    const menuItem = await Menu.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!menuItem) return res.status(404).json({ message: "Item not found" });
    res.json(menuItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete menu item
export const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await Menu.findByIdAndDelete(req.params.id);
    if (!menuItem) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMenuImage = async (req, res) => {
  try {
    const menuItem = await Menu.findById(req.params.id);
    if (!menuItem || !menuItem.image?.data) {
      return res.status(404).json({ message: "Image not found" });
    }
    res.contentType(menuItem.image.contentType);
    res.send(menuItem.image.data);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching image", error: err.message });
  }
};
