// controllers/tableController.js
import Table from "../models/Table.js";

// Create a new table
export const createTable = async (req, res) => {
  try {
    const table = new Table(req.body);
    await table.save();
    res.status(201).json(table);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all tables
export const getTables = async (req, res) => {
  try {
    const tables = await Table.find();
    res.json(tables);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single table by ID
export const getTableById = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ error: "Table not found" });
    res.json(table);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update table
export const updateTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!table) return res.status(404).json({ error: "Table not found" });
    res.json(table);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete table
export const deleteTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndDelete(req.params.id);
    if (!table) return res.status(404).json({ error: "Table not found" });
    res.json({ message: "Table deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTablesByNo = async (req, res) => {
  try {
    const { table_no } = req.query; // e.g. /api/tables?table_no=2

    if (!table_no) {
      return res.status(400).json({ error: "table_no is required" });
    }

    const table = await Table.findOne({ table_no: Number(table_no) });

    if (!table) {
      return res.status(404).json({ error: "Table not found" });
    }

    res.status(200).json(table);
  } catch (error) {
    console.error("Error fetching table by number:", error);
    res.status(500).json({ error: "Server error" });
  }
};
